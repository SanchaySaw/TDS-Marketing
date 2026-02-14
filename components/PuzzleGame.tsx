
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PuzzleGameProps {
  onComplete: () => void;
}

const GRID_SIZE = 3;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;
const SECRET_LOCATION = "90 FT THAKURLI EAST";

// Updated with the latest direct link provided by the user
const PUZZLE_IMAGE_URL = 'https://i.ibb.co/SwvYN073/db64273f-5d15-4808-b207-3070ff2fe067.jpg';

const PuzzleGame: React.FC<PuzzleGameProps> = ({ onComplete }) => {
  const [pieces, setPieces] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalImageUrl, setFinalImageUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const createCompositeImage = useCallback((imgElement: HTMLImageElement) => {
    try {
      const canvas = document.createElement('canvas');
      const size = 600;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setFinalImageUrl(PUZZLE_IMAGE_URL);
        return;
      }

      // Draw the cart image as cover
      const scale = Math.max(size / imgElement.width, size / imgElement.height);
      const x = (size / 2) - (imgElement.width / 2) * scale;
      const y = (size / 2) - (imgElement.height / 2) * scale;
      ctx.drawImage(imgElement, x, y, imgElement.width * scale, imgElement.height * scale);

      // Dark overlay for text contrast
      ctx.fillStyle = 'rgba(15, 59, 46, 0.45)';
      ctx.fillRect(0, 0, size, size);

      // Add the Secret Text (Location)
      ctx.fillStyle = '#f2e6c9';
      ctx.textAlign = 'center';
      ctx.font = '900 64px Montserrat, sans-serif';
      
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 15;
      
      ctx.fillText("90 FT", size / 2, size / 2 - 50);
      ctx.fillText("THAKURLI", size / 2, size / 2 + 25);
      ctx.fillText("EAST", size / 2, size / 2 + 100);

      // Try to get data URL - this might fail if CORS is not allowed by the host
      setFinalImageUrl(canvas.toDataURL('image/png'));
    } catch (e) {
      console.warn("Canvas Composition Failed (Likely CORS). Using Raw Image Fallback.", e);
      // Fallback to the raw image if canvas is tainted
      setFinalImageUrl(PUZZLE_IMAGE_URL);
    }
  }, []);

  const shuffle = useCallback(() => {
    const initial = Array.from({ length: TILE_COUNT }, (_, i) => i);
    let shuffled = [...initial];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Ensure it's not solved at start
    if (shuffled.every((val, i) => val === i)) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    setPieces(shuffled);
  }, []);

  useEffect(() => {
    const img = new Image();
    // Use anonymous to allow canvas processing if server allows it
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      createCompositeImage(img);
      shuffle();
    };

    img.onerror = () => {
      setError("Unable To Load The Cart Image. Please Check Your Connection.");
    };

    img.src = PUZZLE_IMAGE_URL;
  }, [createCompositeImage, shuffle]);

  const handleTileClick = (index: number) => {
    if (isCompleted || !finalImageUrl) return;

    if (selectedIdx === null) {
      setSelectedIdx(index);
    } else {
      const newPieces = [...pieces];
      const temp = newPieces[selectedIdx];
      newPieces[selectedIdx] = newPieces[index];
      newPieces[index] = temp;
      
      setPieces(newPieces);
      setSelectedIdx(null);

      if (newPieces.every((val, i) => val === i)) {
        setIsCompleted(true);
        onComplete();
      }
    }
  };

  if (error) {
    return (
      <div className="w-[320px] h-[320px] flex flex-col items-center justify-center bg-red-900/20 rounded-2xl border border-red-500/50 p-6 text-center gap-4">
        <p className="text-sm font-bold text-red-100 uppercase tracking-widest leading-relaxed">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500/30 rounded-xl text-xs font-black border border-red-500/50">Retry Again</button>
      </div>
    );
  }

  if (!finalImageUrl) {
    return (
      <div className="w-[320px] h-[320px] flex items-center justify-center bg-[#1a5c48]/20 rounded-2xl border border-[#d4af37]/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#f2e6c9] text-xs font-black tracking-widest uppercase animate-pulse">Prepping Your Game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[330px] h-[330px] grid grid-cols-3 gap-1.5 bg-[#0a2e24] p-3 rounded-2xl shadow-2xl border border-[#d4af37]/30">
      {pieces.map((pieceValue, displayIndex) => {
        const row = Math.floor(pieceValue / GRID_SIZE);
        const col = pieceValue % GRID_SIZE;
        const isSelected = selectedIdx === displayIndex;

        const posX = (col / (GRID_SIZE - 1)) * 100;
        const posY = (row / (GRID_SIZE - 1)) * 100;

        return (
          <motion.div
            key={`piece-${pieceValue}`}
            layout
            onClick={() => handleTileClick(displayIndex)}
            className={`
              relative overflow-hidden aspect-square cursor-pointer rounded-lg
              ${isSelected ? 'scale-90 ring-4 ring-[#f2e6c9] z-20 shadow-[0_0_35px_rgba(242,230,201,0.8)]' : 'ring-1 ring-white/10'}
              transition-all duration-300
            `}
            style={{
              backgroundImage: `url(${finalImageUrl})`,
              backgroundSize: '300% 300%',
              backgroundPosition: `${posX}% ${posY}%`,
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Simple dark overlay for unsolved pieces */}
            {!isCompleted && !isSelected && (
               <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors pointer-events-none" />
            )}
            
            {/* Success effect */}
            {isCompleted && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none" 
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default PuzzleGame;
