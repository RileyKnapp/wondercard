import React from 'react';
import { GeneratedCard } from '../types';

interface GalleryProps {
  items: GeneratedCard[];
}

const Gallery: React.FC<GalleryProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 pt-8 border-t border-slate-200">
      <h3 className="text-3xl text-slate-700 font-holiday text-center mb-6">
        Previous Masterpieces
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group relative aspect-[4/3] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
             <img 
              src={item.imageUrl} 
              alt="Generated Card" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a 
                href={item.imageUrl} 
                download={`holiday-card-${item.id}.png`}
                className="text-white text-xs border border-white px-2 py-1 rounded hover:bg-white hover:text-black transition-colors"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;