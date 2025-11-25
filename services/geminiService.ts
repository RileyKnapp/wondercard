import { GoogleGenAI, Type } from "@google/genai";
import { UploadedFile, AspectRatio, ArtStyle } from "../types";

// Helper to get AI Client - assumes API key is in environment from the selection dialog
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Step 1: Analyze images and create a generation plan using Gemini 3 Pro
 * UPDATED: Adapts persona based on style (Photographer vs Digital Artist).
 */
export const analyzeAndPlan = async (
  files: UploadedFile[],
  userInstructions: string,
  style: ArtStyle
): Promise<string> => {
  const ai = getAiClient();
  
  // Prepare parts: instructions + all images
  const imageParts = files.map(f => ({
    inlineData: {
      mimeType: f.mimeType,
      data: f.base64Data
    }
  }));

  const isCartoon = style === 'Cartoonish';
  const role = isCartoon ? "World-Class 3D Character Artist and Illustrator" : "World-Class Portrait Photographer";
  
  const prompt = `
    You are a ${role} and a STRICT CENSUS OFFICER.
    
    INPUT: ${files.length} uploaded image files.
    User Instructions: "${userInstructions}"
    Target Style: "${style}"

    TASK 1: PARANOID CENSUS (CRITICAL)
    1. Assume that EACH uploaded file represents a distinct subject that MUST appear in the final photo, unless they are clearly the exact same person/pet from a different angle.
    2. If there are 3 photos of cats, you must assume there are 3 DISTINCT CATS. Do not merge them into 2 cats.
    3. Explicitly list each subject you find. Assign them a number (Subject 1, Subject 2, etc.).
    4. Describe their key visual features (e.g., "Subject 1: Orange Tabby Cat", "Subject 2: Black Cat with white paws").
    
    TASK 2: SCENE COMPOSITION PROMPT
    Create a single, seamless image generation prompt that:
    1. STARTS with a bold summary: "A ${style} holiday group portrait of [TOTAL COUNT] SUBJECTS: [List them specifically, e.g., '1 Woman, 1 Orange Cat, 1 Black Cat, 1 White Cat']..."
    2. Explicitly positions EVERY subject so they are all visible.
    3. ${isCartoon ? "Translate features into cute, appealing character traits." : "Describe features in a flattering, photogenic way (radiant skin, bright eyes)."}
    4. Ignore temporary blemishes. Describe the "best version" of the subject.
    5. Describes lighting that is magical and warm.
    
    OUTPUT FORMAT:
    Return ONLY the final detailed prompt paragraph. Start the paragraph with the subject count summary.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        ...imageParts,
        { text: prompt }
      ]
    },
    config: {
      systemInstruction: "You are an obsessive accountant of visual subjects. If 3 separate pet photos are uploaded, you MUST ensure the final description accounts for 3 separate pets.",
      thinkingConfig: { thinkingBudget: 2048 }
    }
  });

  return response.text || "A festive holiday card scene with family and pets.";
};

/**
 * Step 2: Generate the final image using Nano Banana Pro (Gemini 3 Pro Image)
 */
export const generateHolidayCard = async (
  plan: string,
  referenceFiles: UploadedFile[],
  aspectRatio: AspectRatio,
  style: ArtStyle
): Promise<string | null> => {
  const ai = getAiClient();

  // We pass the original images again to help the model maintain likeness
  const imageParts = referenceFiles.map(f => ({
    inlineData: {
      mimeType: f.mimeType,
      data: f.base64Data
    }
  }));

  const isCartoon = style === 'Cartoonish';

  const finalPrompt = `
    ${plan}
    
    CRITICAL INSTRUCTIONS:
    - THIS IS A GROUP PHOTO OF ${referenceFiles.length} POTENTIAL SUBJECTS. REFER TO THE PROMPT FOR EXACT COUNT.
    - DO NOT LEAVE ANYONE OUT. If the prompt says 3 cats, render 3 cats.
    - Style: ${style}. ${isCartoon ? "Render as a high-budget 3D animated movie still. Cute, expressive, soft lighting." : "Hyper-realistic, 8k resolution, professional photography."}
    - Preserve the facial identity of the subjects from the reference images, but adapt to the style.
    - Make the subjects look their absolute best: ${isCartoon ? "appealing proportions, warm expressions" : "glowing skin, perfect hair, flattering angles"}.
    - Lighting: Warm, holiday glow, professional composition.
    - Scene: Cohesive and natural integration of all subjects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          ...imageParts,
          { text: finalPrompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Generation error:", error);
    throw error;
  }
};