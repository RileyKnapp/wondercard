import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-12 px-4 flex flex-col items-center justify-center text-center relative overflow-hidden bg-white/50 backdrop-blur-sm border-b border-slate-200">
      
      <div className="z-10 max-w-2xl animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-bold text-slate-800 font-holiday mb-2 leading-none tracking-tight">
          Wonder<span className="text-holiday-red">Card</span>
        </h1>
        <p className="text-2xl md:text-3xl text-holiday-green font-holiday mb-8 font-bold">
          Instant Christmas Cards
        </p>
        <p className="text-slate-600 text-lg md:text-xl font-body leading-relaxed max-w-lg mx-auto">
          Upload individual photos of your favorite <span className="font-bold text-slate-800">people</span> and <span className="font-bold text-slate-800">pets</span>. Our AI magically combines them into the perfect family holiday card in seconds—no photographer required.
        </p>
      </div>
    </header>
  );
};

export default Header;