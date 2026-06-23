
import React, { useState, useEffect, useRef, useCallback } from 'react';
// Use namespace import to fix "no exported member" errors in some environments
import * as ReactRouterDOM from 'react-router-dom';

interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  velocityY: number;
  velocityX: number;
  rotation: number;
  rotationSpeed: number;
}

const TapTrapGame: React.FC = () => {
  const [bestScore, setBestScore] = useState(0);
  const [appearTime, setAppearTime] = useState(0);
  const [isTrap, setIsTrap] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hasLostBefore, setHasLostBefore] = useState(false);
  const [message, setMessage] = useState("");
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: '50%', left: '50%' });
  const [isShaking, setIsShaking] = useState(false);
  const [isWinScreen, setIsWinScreen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const trapTimeoutRef = useRef<number | null>(null);
  const gameLoopTimeoutRef = useRef<number | null>(null);
  const winSoundRef = useRef<HTMLAudioElement>(null);
  const loseSoundRef = useRef<HTMLAudioElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<ConfettiParticle[]>([]);
  const confettiAnimationRef = useRef<number | null>(null);
  
  const resizeCanvas = useCallback(() => {
    if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  const drawConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiRef.current.forEach(p => {
        p.y += p.velocityY;
        p.x += p.velocityX;
        p.rotation += p.rotationSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
        if (p.y > canvas.height + 10) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
    });
    confettiAnimationRef.current = requestAnimationFrame(drawConfetti);
  }, []);

  const startConfetti = useCallback(() => {
    confettiRef.current = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      size: Math.random() * 10 + 5,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`,
      velocityY: Math.random() * 3 + 2,
      velocityX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 5 - 2.5
    }));
    drawConfetti();
  }, [drawConfetti]);

  const stopConfetti = useCallback(() => {
    if (confettiAnimationRef.current) {
      cancelAnimationFrame(confettiAnimationRef.current);
    }
    const canvas = canvasRef.current;
     if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);


  const showButton = useCallback((forceReal = false) => {
    if (gameOver) return;

    const margin = 50, w = 150, h = 70; // Adjusted for better mobile fit
    const maxX = window.innerWidth - w - margin * 2;
    const maxY = window.innerHeight - h - margin * 2;
    setButtonPosition({
        left: `${margin + Math.random() * maxX}px`,
        top: `${margin + Math.random() * maxY}px`
    });

    const trap = !forceReal && Math.random() < 0.3;
    setIsTrap(trap);
    setAppearTime(Date.now());
    setIsButtonVisible(true);
    
    if (trap) {
      setIsShaking(true);
      trapTimeoutRef.current = window.setTimeout(() => {
        setIsShaking(false);
        setIsButtonVisible(false);
        if(!gameOver) gameLoopTimeoutRef.current = window.setTimeout(() => showButton(true), 300);
      }, 2000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    gameLoopTimeoutRef.current = window.setTimeout(showButton, 1000);
    return () => {
        if (trapTimeoutRef.current) clearTimeout(trapTimeoutRef.current);
        if (gameLoopTimeoutRef.current) clearTimeout(gameLoopTimeoutRef.current);
        stopConfetti();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonClick = () => {
    if (gameOver) return;

    if (isTrap) {
      setMessage("💥 TRAP! You lost.");
      setGameOver(true);
      setIsButtonVisible(false);
      if (loseSoundRef.current) loseSoundRef.current.play().catch(() => {});
      setHasLostBefore(true);
      return;
    }

    const reactionTime = Date.now() - appearTime;
    
    if (reactionTime < 250) {
      setMessage(`🎉 ${reactionTime}ms – You Win!`);
      setGameOver(true);
      setIsButtonVisible(false);
      setIsWinScreen(true);
      if (winSoundRef.current) winSoundRef.current.play().catch(() => {});
      startConfetti();
      return;
    }
    
    if (bestScore === 0 || reactionTime < bestScore) {
      setBestScore(reactionTime);
    }
    setMessage(`⏱ ${reactionTime}ms`);
    setIsButtonVisible(false);
    gameLoopTimeoutRef.current = window.setTimeout(showButton, Math.max(400, 2000 - reactionTime));
  };

  const handleRetry = () => {
    setGameOver(false);
    setMessage("");
    setBestScore(0);
    setIsWinScreen(false);
    stopConfetti();
    showButton();
  };
  
  const getButtonText = () => {
      if (isTrap) return "TRAP";
      if (bestScore <= 250 && bestScore > 0) return "Trust Me?";
      return "TAP ME";
  }

  return (
    <div className={`min-h-screen w-full overflow-hidden transition-colors duration-1000 font-mono ${isWinScreen ? 'bg-amber-100 text-black' : 'bg-black text-white'}`}>
      <ReactRouterDOM.Link to="/" className="fixed top-24 left-4 z-50 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors hidden lg:inline-block">
          &larr; Back to Home
      </ReactRouterDOM.Link>
      <p className="fixed top-1.5 left-1/2 -translate-x-1/2 text-yellow-400 text-base md:text-lg z-10 text-center w-full px-2">⚡ React faster than 250ms to WIN!</p>
      <p className="fixed top-10 left-1/2 -translate-x-1/2 text-cyan-400 text-lg md:text-xl z-10">{gameOver && !isWinScreen ? "Try Again!" : `Best Reaction: ${bestScore}ms`}</p>
      <p className="fixed top-20 left-1/2 -translate-x-1/2 text-amber-700 text-base md:text-lg z-10">{message}</p>
      
      {isWinScreen && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
            <p className="text-5xl md:text-7xl text-yellow-500">YOU WON!</p>
            <p className="text-3xl md:text-5xl text-amber-700 mt-8">🏅 Lightning Reflexes!</p>
            {hasLostBefore && <p className="text-xl md:text-3xl text-amber-500 mt-8">Note:- If you win without getting trapped, you get a special screen.</p>}
        </div>
      )}

      {gameOver && !isWinScreen && (
        <button onClick={handleRetry} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl md:text-2xl px-8 py-4 md:px-10 md:py-5 bg-white text-black border-none rounded-xl cursor-pointer z-20 shadow-lg shadow-white hover:bg-amber-100 hover:shadow-2xl">
            Try Again
        </button>
      )}

      {isButtonVisible && (
        <button
          ref={buttonRef}
          onClick={handleButtonClick}
          className={`text-2xl md:text-3xl px-8 py-4 md:px-10 md:py-5 cursor-pointer border-none rounded-xl bg-lime-400 text-black absolute z-10 shadow-lg shadow-lime-400/50 transition-transform duration-200 hover:scale-110 ${isShaking ? 'animate-shake' : ''}`}
          style={{ ...buttonPosition }}
        >
          {getButtonText()}
        </button>
      )}

      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-30"></canvas>
      <audio ref={winSoundRef} src="https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg" preload="auto"></audio>
      <audio ref={loseSoundRef} src="https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg" preload="auto"></audio>
    </div>
  );
};

export default TapTrapGame;
