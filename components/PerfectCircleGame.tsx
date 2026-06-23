
import React, { useState, useEffect, useRef, useCallback } from 'react';
// Use namespace import to fix "no exported member" errors in some environments
import * as ReactRouterDOM from 'react-router-dom';

interface Point {
  x: number;
  y: number;
}

const PerfectCircleGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [score, setScore] = useState("0");
  const [message, setMessage] = useState("Avoid the center dot. It’s evil.");
  const [showCertificate, setShowCertificate] = useState(false);
  const [dotColor, setDotColor] = useState("#f00");
  const [canvasBg, setCanvasBg] = useState("bg-gray-900");
  const [center, setCenter] = useState({ x: 200, y: 200 });

  const redrawCanvas = useCallback((currentPoints: Point[], color: string, currentCenter: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of currentPoints) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(currentCenter.x, currentCenter.y, 6, 0, 2 * Math.PI);
    ctx.fill();
  }, []);

  useEffect(() => {
    const colors = ["#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f"];
    let i = 0;
    const interval = setInterval(() => {
      setDotColor(colors[i++ % colors.length]);
    }, 300);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
     redrawCanvas(points, dotColor, center);
  }, [points, dotColor, center, redrawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(entries => {
      requestAnimationFrame(() => {
        const currentCanvas = canvasRef.current;
        if (!currentCanvas) return;
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            if (currentCanvas.width !== width || currentCanvas.height !== height) {
              currentCanvas.width = width;
              currentCanvas.height = height;
              setCenter({ x: width / 2, y: height / 2 });
            }
        }
      });
    });

    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }

    return () => {
        resizeObserver.disconnect();
    };
  }, []);


  const evaluate = () => {
    if (points.length < 10) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const currentCenter = { x: canvas.width / 2, y: canvas.height / 2 };

    const tooClose = points.some(p => Math.hypot(p.x - currentCenter.x, p.y - currentCenter.y) < (canvas.width * 0.1));

    if (tooClose) {
      audioRef.current?.play().catch(() => {});
      setMessage("You touched the dot. Instant fail.");
      setScore("0");
      return;
    }

    const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    const angles = points.map(p => Math.atan2(p.y - cy, p.x - cx));
    const sorted = angles.slice().sort((a, b) => a - b);
    let maxGap = 0;
    for (let i = 1; i < sorted.length; i++) {
        const gap = sorted[i] - sorted[i-1];
        if (gap > maxGap) maxGap = gap;
    }
    const wrapGap = (2 * Math.PI) - (sorted[sorted.length - 1] - sorted[0]);
    if (wrapGap > maxGap) maxGap = wrapGap;
    const angularCoverage = (2 * Math.PI) - maxGap;

    let newScore = 0;
    let newMsg = "";

    if (angularCoverage < Math.PI * 1.5) {
        newMsg = "That's a line, not a circle.";
    } else {
        const radii = points.map(p => Math.hypot(p.x - cx, p.y - cy));
        const avg = radii.reduce((a, b) => a + b, 0) / radii.length;
        const variance = radii.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / radii.length;
        const normalized = Math.sqrt(variance) / avg;
        newScore = parseFloat(Math.max(0, 100 - normalized * 100).toFixed(2));

        if (newScore > 98) {
            newMsg = "Secret Mode Unlocked!";
            setCanvasBg("bg-gradient-to-br from-cyan-400 via-blue-600 to-black");
            setShowCertificate(true);
            setTimeout(() => {
                setCanvasBg("bg-gray-900");
            }, 3000);
        } else {
            newMsg = newScore > 90 ? "You're a god." :
                     newScore > 75 ? "Respect." :
                     newScore > 50 ? "Meh." :
                     newScore > 25 ? "Try again." :
                     "That was a potato.";
        }
    }
    setScore(newScore.toString());
    setMessage(newMsg);
  };
  
  const handleStart = () => {
    reset(false);
    setDrawing(true);
  };

  const handleEnd = () => {
    if (!drawing) return;
    setDrawing(false);
    evaluate();
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!drawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setPoints(prev => [...prev, { x, y }]);
  };

  const reset = (fullReset = true) => {
    setPoints([]);
    if (fullReset) {
      setScore("0");
      setMessage("Hold and drag to draw. Release to score.");
    }
    setShowCertificate(false);
    setCanvasBg("bg-gray-900");
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans text-center select-none">
       <ReactRouterDOM.Link to="/" className="fixed top-4 left-4 z-50 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors hidden lg:inline-block">
          &larr; Back to Home
      </ReactRouterDOM.Link>
      <h1 className="text-2xl md:text-3xl font-bold">Draw a Perfect Circle</h1>
      <p id="message" className="text-base md:text-lg text-gray-400 h-6 mt-2">{message}</p>
      <div ref={containerRef} className="w-full max-w-[400px] aspect-square mx-auto my-5">
        <canvas
            id="canvas"
            ref={canvasRef}
            className={`block rounded-lg transition-all duration-500 ease-in-out w-full h-full touch-none ${canvasBg}`}
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => {
              e.preventDefault();
              handleStart();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleEnd();
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              handleMove(touch.clientX, touch.clientY);
            }}
        />
      </div>
      <div id="score" className="text-2xl md:text-3xl mt-2">Score: {score}%</div>
      <button id="retryBtn" onClick={() => reset(true)} className="mt-4 px-5 py-2.5 text-lg bg-gray-800 text-white border-none rounded-md cursor-pointer hover:bg-gray-700">Try Again</button>
      
      {showCertificate && (
        <div id="certificate" className="mt-8 mx-auto p-5 w-full max-w-xs bg-gray-800 border-2 border-cyan-400 rounded-xl text-cyan-400">
          <h3 className="font-bold text-xl">🏅 Certificate of Mastery</h3>
          <p className="mt-2">This certifies that <strong>Anonymous</strong><br/>
          has achieved a score of <strong>{score}%</strong><br/>
          in the Perfect Circle Challenge.</p>
          <p className="mt-2">Signed: The Dot<br/>Date: {new Date().toLocaleDateString()}</p>
        </div>
      )}
      <audio id="failSound" ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"></audio>
    </div>
  );
};

export default PerfectCircleGame;
