
import React, { useState } from 'react';
// Use namespace import to fix "no exported member" errors in some environments
import * as ReactRouterDOM from 'react-router-dom';

const PotatoClickerGame: React.FC = () => {
  const [clicks, setClicks] = useState(0);
  const targetClicks = 10000;

  const handlePotatoClick = () => {
    if (clicks < targetClicks) {
      setClicks(clicks + 1);
    }
  };
  
  const isWinner = clicks >= targetClicks;

  return (
    <div className="bg-[#fdf6e3] min-h-screen flex flex-col items-center justify-center p-4 font-sans select-none overflow-hidden">
       <ReactRouterDOM.Link to="/" className="fixed top-6 left-6 z-50 px-5 py-2.5 bg-amber-700 text-white rounded-xl hover:bg-amber-800 transition-all shadow-lg font-bold hidden lg:inline-block">
          &larr; Back to Home
      </ReactRouterDOM.Link>
      
      <div className="text-center z-10">
        <h1 className="text-6xl sm:text-8xl mb-6 font-dancing-script font-bold text-amber-900 drop-shadow-md">
          Potato Clicker
        </h1>
        <div className={`text-4xl sm:text-5xl mb-8 font-mono font-bold transition-all duration-300 ${clicks >= 5000 ? 'text-orange-600 scale-110' : 'text-amber-800'}`}>
          {clicks.toLocaleString()} <span className="text-2xl opacity-50">/ {targetClicks.toLocaleString()}</span>
        </div>
      </div>
      
      {!isWinner ? (
        <div 
          id="potato-target" 
          className="relative group cursor-pointer active:scale-95 transition-transform duration-75 flex flex-col items-center"
          onClick={handlePotatoClick}
        >
          {/* Main Potato Body using SVG for an organic shape */}
          <div className="relative w-72 h-56 sm:w-96 sm:h-72 flex items-center justify-center">
             <svg viewBox="0 0 200 150" className="absolute inset-0 w-full h-full drop-shadow-[0_20px_40px_rgba(94,50,10,0.4)] transition-filter duration-200 group-hover:brightness-110">
                <path 
                  d="M40,75 C40,30 80,20 120,20 C170,20 190,50 190,85 C190,120 160,140 110,140 C60,140 40,110 40,75 Z" 
                  fill="#92400e" 
                />
                {/* Realistic Potato Texture dots */}
                <circle cx="70" cy="50" r="2" fill="#451a03" opacity="0.3" />
                <circle cx="150" cy="90" r="3" fill="#451a03" opacity="0.2" />
                <circle cx="100" cy="110" r="2" fill="#451a03" opacity="0.4" />
                <circle cx="130" cy="40" r="2.5" fill="#451a03" opacity="0.25" />
                <circle cx="60" cy="100" r="2" fill="#451a03" opacity="0.3" />
             </svg>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center animate-bounce">
          <span className="text-9xl mb-4">👑</span>
          <div className="text-center text-5xl sm:text-7xl font-black px-4 text-amber-900 drop-shadow-lg uppercase">
            POTATO KING!
          </div>
        </div>
      )}

      <div className="mt-16 bg-white px-12 py-6 border-b-[10px] border-amber-400 rounded-[2.5rem] shadow-2xl">
        <div className="text-3xl text-amber-900 font-black uppercase tracking-[0.2em] text-center">
          {isWinner ? "LEGENDARY STATUS" : "You can do it!"}
        </div>
      </div>

      {isWinner && (
        <div className="mt-8 text-amber-800 font-black text-xl bg-amber-200 px-6 py-2 rounded-full shadow-inner">
          Total Harvested Power: 10,000
        </div>
      )}
    </div>
  );
};

export default PotatoClickerGame;
