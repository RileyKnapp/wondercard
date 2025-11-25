import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import Gallery from './components/Gallery';
import DonationModal from './components/DonationModal';
import { UploadedFile, AppStatus, GeneratedCard, AspectRatio, ArtStyle } from './types';
import { analyzeAndPlan, generateHolidayCard } from './services/geminiService';
import { saveToGallery, loadGallery } from './services/utils';
import { trackEvent } from './services/analytics';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [gallery, setGallery] = useState<GeneratedCard[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDonation, setShowDonation] = useState(false);
  
  // Configuration State
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4'); // Portrait default
  const [style, setStyle] = useState<ArtStyle>('Photorealistic');

  // Initial Gallery Load & Key Check
  useEffect(() => {
    setGallery(loadGallery());
    checkApiKey();
    trackEvent('page_view', { title: document.title });
  }, []);

  const checkApiKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.hasSelectedApiKey) {
      const selected = await aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } else {
      console.warn("AI Studio wrapper not found.");
    }
  };

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.openSelectKey) {
      await aistudio.openSelectKey();
      await checkApiKey();
      trackEvent('api_key_selected');
    }
  };

  const handleGenerate = async () => {
    if (uploadedFiles.length === 0) {
      setErrorMsg("Please upload at least one photo.");
      return;
    }
    
    setErrorMsg(null);
    setStatus(AppStatus.ANALYZING);
    setGeneratedImages([]);

    trackEvent('generate_start', {
      fileCount: uploadedFiles.length,
      style: style,
      aspectRatio: aspectRatio
    });

    try {
      // Step 1: Gemini 3 Pro Analysis
      const plan = await analyzeAndPlan(uploadedFiles, prompt, style);
      
      setStatus(AppStatus.GENERATING);

      // Step 2: Nano Banana Pro Generation
      // Pass the selected style to generation service
      const promises = [
        generateHolidayCard(plan, uploadedFiles, aspectRatio, style),
        generateHolidayCard(plan, uploadedFiles, aspectRatio, style)
      ];

      const results = await Promise.all(promises);
      const validImages = results.filter(img => img !== null) as string[];

      if (validImages.length > 0) {
        setGeneratedImages(validImages);
        setStatus(AppStatus.SUCCESS);
        
        // Save first result to gallery
        const newGallery = saveToGallery(validImages[0], `${style} Holiday Card`);
        setGallery(newGallery);
        
        trackEvent('generate_success', { count: validImages.length });
      } else {
        throw new Error("No images were generated.");
      }

    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      trackEvent('generate_error', { message: err.message });
      
      if (err.message?.includes("Requested entity was not found") || err.toString().includes("404")) {
          setHasKey(false);
          setErrorMsg("API Key session expired. Please select a key again.");
      }
    }
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setPrompt("");
    setStatus(AppStatus.IDLE);
    setGeneratedImages([]);
    setErrorMsg(null);
    trackEvent('reset_app');
  };

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>, imgUrl: string, index: number) => {
    // We let the default anchor tag behavior happen (download)
    // Then we trigger the modal
    trackEvent('download_card', { style, aspectRatio, index });
    setTimeout(() => {
      setShowDonation(true);
    }, 1000);
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-[#FBF6F3] flex flex-col items-center justify-center p-4 font-body">
        <Header />
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center mt-8 border border-slate-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
            🎁
          </div>
          <h2 className="text-3xl font-holiday text-slate-800 mb-4">Get Started</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Connect your Google Cloud project to start generating magical holiday cards with Gemini 3.
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full bg-holiday-red hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Select API Key
          </button>
          <div className="mt-6 text-sm text-slate-400">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">
              Read Billing Documentation
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6F3] font-body pb-20 selection:bg-red-100">
      <Header />
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />

      <main className="container mx-auto px-4 pt-8">
        
        {errorMsg && (
           <div className="max-w-4xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Main Workflow Grid */}
        <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto">
          
          {/* Left Column: Inputs */}
          <div className="flex-1 space-y-8">
             <UploadSection 
               files={uploadedFiles} 
               setFiles={setUploadedFiles} 
               disabled={status === AppStatus.ANALYZING || status === AppStatus.GENERATING} 
             />

             {/* Configuration Panel */}
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60">
                <h2 className="text-2xl text-slate-800 font-holiday mb-6 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-holiday-green text-sm font-sans font-bold">2</span>
                  Customize Style
                </h2>
                
                {/* Style Selector */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Art Style</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Photorealistic', 'Oil Painting', 'Cartoonish', 'Vintage Film'] as ArtStyle[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStyle(s)}
                        disabled={status !== AppStatus.IDLE && status !== AppStatus.SUCCESS}
                        className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 ${
                          style === s 
                            ? 'bg-holiday-red text-white border-holiday-red shadow-lg shadow-red-200' 
                            : 'bg-white text-slate-600 border-slate-100 hover:border-red-100 hover:bg-slate-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio Selector */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Card Shape</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['3:4', '4:3', '1:1', '16:9'] as AspectRatio[]).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        disabled={status !== AppStatus.IDLE && status !== AppStatus.SUCCESS}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                          aspectRatio === ratio 
                            ? 'bg-holiday-green text-white border-holiday-green shadow-lg shadow-green-100' 
                            : 'bg-white text-slate-600 border-slate-100 hover:border-green-100 hover:bg-slate-50'
                        }`}
                      >
                        {ratio === '3:4' ? 'Portrait' : ratio === '4:3' ? 'Landscape' : ratio === '1:1' ? 'Square' : 'Wide'}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Custom Instructions (Optional)</label>
                <textarea
                  className="w-full border-2 border-slate-100 rounded-xl p-4 focus:ring-4 focus:ring-green-50 focus:border-holiday-green outline-none resize-none h-32 text-sm transition-all"
                  placeholder="E.g., Make us wear matching red sweaters, add snow falling, we are in a cozy cabin..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={status === AppStatus.ANALYZING || status === AppStatus.GENERATING}
                />
             </div>

             <div className="flex flex-col sm:flex-row gap-4">
               <button
                 onClick={handleGenerate}
                 disabled={status === AppStatus.ANALYZING || status === AppStatus.GENERATING || uploadedFiles.length === 0}
                 className={`flex-1 py-5 rounded-2xl font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 ${
                   status === AppStatus.ANALYZING || status === AppStatus.GENERATING 
                   ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                   : 'bg-gradient-to-r from-holiday-green to-[#1f7a46] text-white hover:shadow-green-200'
                 }`}
               >
                 {status === AppStatus.ANALYZING ? 'Analysing Photos...' : 
                  status === AppStatus.GENERATING ? 'Painting Card...' : 
                  '✨ Create My Card'}
               </button>
               
               {status === AppStatus.SUCCESS && (
                 <button 
                   onClick={handleReset}
                   className="px-8 py-5 rounded-2xl font-bold text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 transition-colors"
                 >
                   Reset
                 </button>
               )}
             </div>
          </div>

          {/* Right Column: Results */}
          <div className="flex-1">
            {status === AppStatus.IDLE && (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-3xl bg-white/50 p-10 text-center">
                 <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                    </svg>
                 </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">Your masterpiece awaits</h3>
                <p className="text-slate-400 max-w-xs mx-auto">Upload your photos on the left to start the holiday magic.</p>
              </div>
            )}

            {(status === AppStatus.ANALYZING || status === AppStatus.GENERATING) && (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl p-10 border border-slate-100">
                <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-slate-100 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-24 h-24 border-4 border-holiday-red border-t-transparent rounded-full animate-spin"></div>
                </div>
                
                <h3 className="text-3xl font-holiday text-slate-800 animate-pulse mb-4">
                  {status === AppStatus.ANALYZING ? "Learning Faces..." : "Creating Magic..."}
                </h3>
                
                <div className="max-w-xs w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                  <div className={`h-full bg-holiday-green transition-all duration-1000 ${status === AppStatus.ANALYZING ? 'w-1/3' : 'w-4/5'}`}></div>
                </div>

                <p className="text-slate-500 max-w-sm text-center leading-relaxed font-medium mb-2">
                  {status === AppStatus.ANALYZING 
                    ? "Our AI is studying your photos to capture every detail perfectly."
                    : "Composing your scene, adjusting lighting, and applying the final polish."}
                </p>
                <p className="text-slate-400 text-sm font-medium">
                  This process may take a minute.
                </p>
              </div>
            )}

            {status === AppStatus.SUCCESS && (
              <div className="space-y-8 animate-fade-in">
                 {generatedImages.map((img, idx) => (
                   <div key={idx} className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 transform transition-all hover:scale-[1.01]">
                     <div className={`w-full overflow-hidden rounded-2xl mb-6 bg-slate-50 shadow-inner ${
                       aspectRatio === '1:1' ? 'aspect-square' :
                       aspectRatio === '3:4' ? 'aspect-[3/4]' :
                       aspectRatio === '4:3' ? 'aspect-[4/3]' : 'aspect-video'
                     }`}>
                       <img src={img} alt={`Generated variation ${idx + 1}`} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                       <span className="font-holiday text-2xl text-slate-800">Variation {idx + 1}</span>
                       <a 
                         href={img} 
                         download={`instant-xmas-card-${Date.now()}-${idx}.png`}
                         onClick={(e) => handleDownload(e, img, idx)}
                         className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 12.75l-3-3m0 0 3-3m-3 3h7.5" />
                         </svg>
                         Download High Res
                       </a>
                     </div>
                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>

        <Gallery items={gallery} />
      </main>
    </div>
  );
};

export default App;