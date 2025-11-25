import { UploadedFile } from '../types';
// @ts-ignore
import heic2any from 'heic2any';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const processFiles = async (files: File[]): Promise<UploadedFile[]> => {
  const processed: UploadedFile[] = [];
  
  for (const file of files) {
    let fileToProcess = file;
    const isHeic = file.type === 'image/heic' || 
                   file.type === 'image/heif' || 
                   file.name.toLowerCase().endsWith('.heic') || 
                   file.name.toLowerCase().endsWith('.heif');

    if (isHeic) {
      try {
        console.log(`Converting HEIC/HEIF file: ${file.name}`);
        const resultBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });

        // heic2any can return a single Blob or an array of Blobs
        const blob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;

        // Create a new File object
        fileToProcess = new File(
          [blob], 
          file.name.replace(/\.(heic|heif)$/i, '.jpg'), 
          { type: 'image/jpeg' }
        );
      } catch (error) {
        console.error("HEIC conversion failed for:", file.name, error);
        // Continue loop to try next file.
        // We skip adding this file to processed list to avoid broken images.
        continue;
      }
    }

    try {
      const base64Data = await fileToBase64(fileToProcess);
      processed.push({
        id: crypto.randomUUID(),
        file: fileToProcess,
        previewUrl: URL.createObjectURL(fileToProcess),
        base64Data,
        mimeType: fileToProcess.type,
      });
    } catch (e) {
      console.error("Failed to process file:", fileToProcess.name, e);
    }
  }
  return processed;
};

export const saveToGallery = (imageUrl: string, prompt: string) => {
  const key = 'holiday_card_gallery';
  const newItem = {
    id: crypto.randomUUID(),
    imageUrl,
    timestamp: Date.now(),
    prompt
  };
  
  try {
    const existing = localStorage.getItem(key);
    const list = existing ? JSON.parse(existing) : [];
    // Keep only last 5
    const updated = [newItem, ...list].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save to gallery", e);
    return [];
  }
};

export const loadGallery = () => {
  try {
    const existing = localStorage.getItem('holiday_card_gallery');
    return existing ? JSON.parse(existing) : [];
  } catch (e) {
    return [];
  }
};