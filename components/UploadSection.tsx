import React, { useCallback, useState } from 'react';
import { UploadedFile } from '../types';
import { processFiles } from '../services/utils';

interface UploadSectionProps {
  files: UploadedFile[];
  setFiles: (files: UploadedFile[]) => void;
  disabled: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({ files, setFiles, disabled }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      try {
        // Convert FileList to Array
        const fileArray = Array.from(e.target.files) as File[];
        // Limit total files to 10
        const remainingSlots = 10 - files.length;
        const filesToProcess = fileArray.slice(0, remainingSlots);
        
        if (filesToProcess.length > 0) {
          const processed = await processFiles(filesToProcess);
          setFiles([...files, ...processed]);
        }
      } catch (error) {
        console.error("Error processing files:", error);
      } finally {
        setIsProcessing(false);
        // Reset input
        e.target.value = '';
      }
    }
  }, [files, setFiles]);

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const isDisabled = disabled || isProcessing;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
           <h2 className="text-2xl text-holiday-green font-holiday">
            1. Upload Photos (Max 10)
          </h2>
          {isProcessing && (
            <span className="text-sm text-holiday-gold font-bold animate-pulse">
              Processing & Converting...
            </span>
          )}
        </div>
       
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {files.map((file) => (
            <div key={file.id} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              <img 
                src={file.previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => removeFile(file.id)}
                disabled={isDisabled}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
              >
                &times;
              </button>
            </div>
          ))}
          
          {files.length < 10 && (
            <label className={`flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="text-slate-400 mb-2">
                {isProcessing ? (
                   <div className="w-8 h-8 border-2 border-slate-300 border-t-holiday-green rounded-full animate-spin mx-auto"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-slate-500 font-medium">
                {isProcessing ? 'Processing...' : 'Add Photo'}
              </span>
              <input 
                type="file" 
                multiple 
                accept="image/png, image/jpeg, image/jpg, image/heic, .heic, .heif" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isDisabled}
              />
            </label>
          )}
        </div>
        <p className="text-xs text-slate-400">Supported formats: JPG, PNG, HEIC. Upload photos of people and pets you want in the card.</p>
      </div>
    </div>
  );
};

export default UploadSection;