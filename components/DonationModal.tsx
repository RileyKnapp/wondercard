import React from 'react';
import { trackEvent } from '../services/analytics';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDonationClick = (charityName: string) => {
    trackEvent('click_donation', { charity: charityName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative border border-slate-100 transform transition-all scale-100">
        
        {/* Decorative Header */}
        <div className="bg-holiday-red p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          <h3 className="text-3xl font-holiday text-white relative z-10">Spread the Holiday Cheer! 🎁</h3>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="p-8 text-center">
          <p className="text-slate-600 mb-6 leading-relaxed">
            We hope you love your new holiday card! Since you saved time and money on a photographer this year, please consider sharing the joy by donating to a wonderful cause.
          </p>

          <div className="space-y-3 mb-8">
            <a 
              href="https://www.toysfortots.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => handleDonationClick('Toys for Tots')}
              className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-red-100 hover:bg-red-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚂</span>
                <span className="font-bold text-slate-700 group-hover:text-holiday-red">Toys for Tots</span>
              </div>
              <span className="text-slate-400 group-hover:text-holiday-red">Donate &rarr;</span>
            </a>

            <a 
              href="https://www.salvationarmyusa.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => handleDonationClick('The Salvation Army')}
              className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-red-100 hover:bg-red-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔔</span>
                <span className="font-bold text-slate-700 group-hover:text-holiday-red">The Salvation Army</span>
              </div>
              <span className="text-slate-400 group-hover:text-holiday-red">Donate &rarr;</span>
            </a>

            <a 
              href="https://wish.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => handleDonationClick('Make-A-Wish')}
              className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-red-100 hover:bg-red-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <span className="font-bold text-slate-700 group-hover:text-holiday-red">Make-A-Wish</span>
              </div>
              <span className="text-slate-400 group-hover:text-holiday-red">Donate &rarr;</span>
            </a>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 text-sm hover:text-slate-600 font-medium underline decoration-slate-300 underline-offset-4"
          >
            Maybe later, back to my card
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;