
import React, { useState, useEffect, useRef } from 'react';
// Use namespace import to fix "no exported member" errors in some environments
import * as ReactRouterDOM from 'react-router-dom';

const FloatingEmoji: React.FC<{ emoji: string; mousePos: { x: number; y: number }; offset: { x: number; y: number; speed: number } }> = ({ emoji, mousePos, offset }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);
  const internalOffset = useRef(0);

  useEffect(() => {
    const animate = () => {
      internalOffset.current += offset.speed;
      const x = mousePos.x + offset.x + Math.sin(internalOffset.current) * 5;
      const y = mousePos.y + offset.y + Math.cos(internalOffset.current) * 5;
      setPosition({ x, y });
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [mousePos, offset]);

  return (
    <div
      className="fixed top-0 left-0 text-2xl pointer-events-none z-50"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      {emoji}
    </div>
  );
};


const HomePage: React.FC = () => {
  const [titleColor, setTitleColor] = useState('#000000');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const intervalRef = useRef<number | null>(null);

  const colors = ['#ff0066', '#00ccff', '#ffcc00', '#66ff33', '#ff3300', '#9933ff'];

  const handleTitleClick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      setTitleColor(colors[i % colors.length]);
      i++;
    }, 300);

    setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTitleColor('#000000');
    }, 2000);
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-[#F5F7FA] text-black min-h-screen flex flex-col items-center font-sans">
      <FloatingEmoji emoji="🎮" mousePos={mousePos} offset={{ x: 10, y: 10, speed: 0.05 }} />
      <FloatingEmoji emoji="✨" mousePos={mousePos} offset={{ x: -30, y: -30, speed: 0.07 }} />

      <header className="pt-20 w-full">
        <h1
          className="font-dancing-script text-7xl sm:text-8xl md:text-9xl font-normal mb-4 cursor-pointer transition-all duration-300 ease-in-out text-center px-4"
          style={{ color: titleColor }}
          onClick={handleTitleClick}
        >
          games.fun
        </h1>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl p-5 w-full">
          <ReactRouterDOM.Link to="/tap-trap" className="game-box">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8 md:p-12 text-center transition-transform duration-200 shadow-md hover:scale-105 hover:border-black hover:shadow-xl cursor-pointer h-full">
              <h2 className="mb-4 text-2xl md:text-3xl text-black">Tap Trap</h2>
              <p className="text-base md:text-lg text-black">Reflex test. One wrong tap game over</p>
            </div>
          </ReactRouterDOM.Link>
          <ReactRouterDOM.Link to="/perfect-circle" className="game-box">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8 md:p-12 text-center transition-transform duration-200 shadow-md hover:scale-105 hover:border-black hover:shadow-xl cursor-pointer h-full">
              <h2 className="mb-4 text-2xl md:text-3xl text-black">Perfect Circle</h2>
              <p className="text-base md:text-lg text-black">How well can you draw a perfect circle?</p>
            </div>
          </ReactRouterDOM.Link>
          <ReactRouterDOM.Link to="/potato-clicker" className="game-box">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8 md:p-12 text-center transition-transform duration-200 shadow-md hover:scale-105 hover:border-black hover:shadow-xl cursor-pointer h-full">
              <h2 className="mb-4 text-2xl md:text-3xl text-black">Potato Clicker</h2>
              <p className="text-base md:text-lg text-black">Click the potato (aloo) 10,000 times to win!</p>
            </div>
          </ReactRouterDOM.Link>
        </div>
      </main>

      <footer className="py-10 px-4 w-full">
        <div className="text-center font-dancing-script text-3xl md:text-5xl text-black leading-loose flex flex-col items-center">
          <div className="w-full overflow-hidden whitespace-nowrap opacity-60">
            x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x
          </div>
          <span className="px-4">many interesting and amazing games are coming soon!</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
