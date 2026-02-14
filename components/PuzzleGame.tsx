
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PuzzleGameProps {
  onComplete: () => void;
}

const GRID_SIZE = 3;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;
const PUZZLE_IMAGE_URL = 'https://i.ibb.co/SwvYN073/db64273f-5d15-4808-b207-3070ff2fe067.jpg';

const PuzzleGame: React.FC<PuzzleGameProps> = ({ onComplete }) => {
  // pieces[i] stores the original index of the tile currently at grid position i.
  // The empty slot is TILE_COUNT - 1.
  const [pieces, setPieces] = useState<number[]>([]);
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

      const scale = Math.max(size / imgElement.width, size / imgElement.height);
      const x = (size / 2) - (imgElement.width / 2) * scale;
      const y = (size / 2) - (imgElement.height / 2) * scale;
      ctx.drawImage(imgElement, x, y, imgElement.width * scale, imgElement.height * scale);

      ctx.fillStyle = 'rgba(15, 59, 46, 0.45)';
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = '#f2e6c9';
      ctx.textAlign = 'center';
      ctx.font = '900 64px Montserrat, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 15;
      
      ctx.fillText("90 FT", size / 2, size / 2 - 50);
      ctx.fillText("THAKURLI", size / 2, size / 2 + 25);
      ctx.fillText("EAST", size / 2, size / 2 + 100);

      setFinalImageUrl(canvas.toDataURL('image/png'));
    } catch (e) {
      setFinalImageUrl(PUZZLE_IMAGE_URL);
    }
  }, []);

  const shuffle = useCallback(() => {
    // Start with a solved state
    let state = Array.from({ length: TILE_COUNT }, (_, i) => i);
    let emptyIdx = TILE_COUNT - 1;

    // Simulate 100 valid moves to ensure solvability
    for (let i = 0; i < 100; i++) {
      const row = Math.floor(emptyIdx / GRID_SIZE);
      const col = emptyIdx % GRID_SIZE;
      
      const options = [];
      if (row > 0) options.push(emptyIdx - GRID_SIZE);
      if (row < GRID_SIZE - 1) options.push(emptyIdx + GRID_SIZE);
      if (col > 0) options.push(emptyIdx - 1);
      if (col < GRID_SIZE - 1) options.push(emptyIdx + 1);
      
      const moveIdx = options[Math.floor(Math.random() * options.length)];
      [state[emptyIdx], state[moveIdx]] = [state[moveIdx], state[emptyIdx]];
      emptyIdx = moveIdx;
    }
    
    setPieces(state);
  }, []);

  useEffect(() => {
    const img = new Image();
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

  const handlePieceClick = (clickedIdx: number) => {
    if (isCompleted) return;

    const emptyIdx = pieces.indexOf(TILE_COUNT - 1);
    
    const row = Math.floor(clickedIdx / GRID_SIZE);
    const col = clickedIdx % GRID_SIZE;
    const eRow = Math.floor(emptyIdx / GRID_SIZE);
    const eCol = emptyIdx % GRID_SIZE;

    // A tile is adjacent if it's in the same row/col and distance is 1
    const dist = Math.abs(row - eRow) + Math.abs(col - eCol);

    if (dist === 1) {
      const newState = [...pieces];
      [newState[clickedIdx], newState[emptyIdx]] = [newState[emptyIdx], newState[clickedIdx]];
      setPieces(newState);

      // Check if solved (ignoring empty space for now, or matching exactly)
      if (newState.every((val, i) => val === i)) {
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
      {pieces.map((pieceValue, gridIndex) => {
        const isEmpty = pieceValue === TILE_COUNT - 1;
        const originalRow = Math.floor(pieceValue / GRID_SIZE);
        const originalCol = pieceValue % GRID_SIZE;

        const posX = (originalCol / (GRID_SIZE - 1)) * 100;
        const posY = (originalRow / (GRID_SIZE - 1)) * 100;

        return (
          <motion.div
            key={`tile-${pieceValue}`}
            layout
            onClick={() => handlePieceClick(gridIndex)}
            className={`
              relative overflow-hidden aspect-square cursor-pointer rounded-lg
              ${isEmpty && !isCompleted ? 'bg-transparent' : 'ring-1 ring-white/10 shadow-lg bg-[#1a5c48]'}
              transition-all duration-300
            `}
            style={{
              backgroundImage: (isEmpty && !isCompleted) ? 'none' : `url(${finalImageUrl})`,
              backgroundSize: '300% 300%',
              backgroundPosition: `${posX}% ${posY}%`,
            }}
          >
            {isCompleted && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" 
              />
            )}
            {!isCompleted && !isEmpty && (
              <div className="absolute inset-0 bg-black/10 active:bg-transparent" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default PuzzleGame;
