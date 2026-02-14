
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import canvasConfetti from 'canvas-confetti';
import { Instagram, Send, Share2, MapPin, CheckCircle, ChevronRight } from 'lucide-react';
import { AppScreen } from './types';
import PuzzleGame from './components/PuzzleGame';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.LANDING);
  const [hasFollowed, setHasFollowed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Generate or retrieve a unique ID for the user session
  const uniqueId = useMemo(() => {
    const existingId = localStorage.getItem('tds_unique_id');
    if (existingId) return existingId;
    const newId = Math.random().toString(36).substring(2, 7).toUpperCase();
    localStorage.setItem('tds_unique_id', newId);
    return newId;
  }, []);

  // Load progress on mount
  useEffect(() => {
    const savedScreen = localStorage.getItem('tds_current_screen') as AppScreen;
    const followed = localStorage.getItem('tds_has_followed') === 'true';
    
    if (savedScreen && Object.values(AppScreen).includes(savedScreen)) {
      setCurrentScreen(savedScreen);
    }
    setHasFollowed(followed);
    setIsLoaded(true);
  }, []);

  // Sync progress to localStorage
  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
    localStorage.setItem('tds_current_screen', screen);
  };

  const nextScreen = () => {
    const screens = Object.values(AppScreen);
    const currentIndex = screens.indexOf(currentScreen);
    if (currentIndex < screens.length - 1) {
      navigateTo(screens[currentIndex + 1] as AppScreen);
    }
  };

  const handlePuzzleComplete = () => {
    canvasConfetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f2e6c9', '#d4af37', '#ffffff']
    });
    setTimeout(() => {
      nextScreen();
    }, 1500);
  };

  const handleFollowClick = () => {
    // Redirect in same tab
    localStorage.setItem('tds_has_followed', 'true');
    setHasFollowed(true);
    window.open('https://instagram.com/thedrinkstop.in', '_self');
  };

  const handleDMClick = () => {
    const message = encodeURIComponent(`Hey! I Solved Your Puzzle 😎 Location: 90 Ft Thakurli East. My Unique Code Is TDS10-${uniqueId}. Loved The Game!`);
    // Using ig.me for direct DM redirection
    window.open(`https://ig.me/m/thedrinkstop.in?text=${message}`, '_self');
    nextScreen();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`I Just Unlocked 10% OFF At The Drink Stop 😍 90 Ft Thakurli East. Play The Puzzle! My Code: TDS10-${uniqueId}`);
    window.open(`https://wa.me/?text=${text}`, '_self');
  };

  const handleStoryShare = () => {
    alert("Take A Screenshot Of This Page And Tag Us @Thedrinkstop.In On Your Story! 💚");
    nextScreen();
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  };

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto overflow-hidden relative bg-[#0f3b2e]">
      <AnimatePresence mode="wait">
        {currentScreen === AppScreen.LANDING && (
          <motion.div
            key="landing"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col items-center justify-between p-8 text-center"
          >
            <div className="mt-20">
              <h1 className="text-5xl font-black tracking-tighter leading-none mb-2 text-[#f2e6c9]">
                The<br />Drink<br />Støp
              </h1>
              <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="space-y-6 w-full">
              <p className="text-xl font-bold opacity-90 text-[#f2e6c9]">
                🧩 Location Unlock Challenge
              </p>
              <button
                onClick={nextScreen}
                className="w-full py-4 bg-[#1a5c48] text-[#f2e6c9] rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-xl border-b-4 border-[#0a2e24]"
              >
                Start Puzzle <ChevronRight size={24} />
              </button>
            </div>

            <p className="mb-8 font-bold tracking-widest uppercase text-xs opacity-50">
              Sip Different.
            </p>
          </motion.div>
        )}

        {currentScreen === AppScreen.QUESTION && (
          <motion.div
            key="question"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-black leading-tight">
                Bhai Pehle Ye Bata…<br />
                Thakurli Ke Best Drinks Kahan Milenge? 👀
              </h2>
              <p className="text-lg opacity-75">
                Puzzle Solve Karo Aur Location Unlock Karo.
              </p>
            </div>
            
            <button
              onClick={nextScreen}
              className="px-12 py-4 bg-[#1a5c48] text-[#f2e6c9] rounded-2xl font-black text-xl shadow-lg border-b-4 border-[#0a2e24]"
            >
              Let’s Go
            </button>
          </motion.div>
        )}

        {currentScreen === AppScreen.PUZZLE && (
          <motion.div
            key="puzzle"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col items-center justify-center p-4"
          >
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-black mb-1">Fix The Cart</h3>
              <p className="text-sm opacity-70 italic">Tap Pieces To Swap & Reveal Location</p>
            </div>
            
            <PuzzleGame onComplete={handlePuzzleComplete} />
          </motion.div>
        )}

        {currentScreen === AppScreen.REVEAL && (
          <motion.div
            key="reveal"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12"
          >
            <div className="space-y-4">
              <div className="bg-[#d4af37]/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin size={48} className="text-[#d4af37]" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter">
                📍 90 Ft Thakurli East
              </h2>
              <div className="bg-[#f2e6c9] text-[#0f3b2e] px-6 py-3 rounded-xl inline-block font-black text-2xl rotate-2 shadow-2xl">
                🎉 10% Off!
              </div>
            </div>

            <div className="space-y-2 w-full">
              <p className="text-xs font-bold opacity-60 mb-4 uppercase tracking-widest">Puzzle Solved Successfully!</p>
              <button
                onClick={nextScreen}
                className="w-full py-4 bg-[#1a5c48] text-[#f2e6c9] rounded-2xl font-black text-xl flex items-center justify-center gap-2 shadow-lg"
              >
                Claim Now <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {currentScreen === AppScreen.FOLLOW_GATE && (
          <motion.div
            key="follow"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-10"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-black leading-tight text-[#f2e6c9]">Discount Chahiye? <br/>Follow Zaroori Hai 😏</h2>
            </div>

            <div className="w-full space-y-4">
              <button
                onClick={handleFollowClick}
                className="w-full py-5 bg-[#f2e6c9] text-[#0f3b2e] rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl"
              >
                <Instagram size={24} /> Follow @Thedrinkstop.In
              </button>

              <button
                onClick={hasFollowed ? nextScreen : undefined}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all border-2 border-[#1a5c48] ${
                  hasFollowed 
                    ? 'bg-[#1a5c48] text-[#f2e6c9] opacity-100' 
                    : 'bg-transparent text-[#1a5c48] opacity-50'
                }`}
              >
                {hasFollowed ? 'I Followed ✅' : 'Follow Karo Pehle'}
              </button>
            </div>
          </motion.div>
        )}

        {currentScreen === AppScreen.AUTO_DM && (
          <motion.div
            key="dm"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-10"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-black">Almost Done 👇</h2>
              <p className="opacity-75 italic text-sm">Send Your Location Reveal Answer To Our DM To Lock In Your Discount 💚</p>
            </div>

            <button
              onClick={handleDMClick}
              className="w-full py-5 bg-[#1a5c48] text-[#f2e6c9] rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl border-b-4 border-[#0a2e24]"
            >
              <Send size={24} /> Send Answer To Instagram
            </button>
          </motion.div>
        )}

        {currentScreen === AppScreen.SHARE && (
          <motion.div
            key="share"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-10"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-black">🔥 Flex Your Win</h2>
              <p className="opacity-75">Tell The Squad Where To Meet.</p>
            </div>

            <div className="w-full space-y-4">
              <button
                onClick={handleStoryShare}
                className="w-full py-4 border-2 border-[#f2e6c9] text-[#f2e6c9] rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg"
              >
                <Share2 size={20} /> Share On Instagram Story
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg"
              >
                <Share2 size={20} /> Whatsapp Share
              </button>
              
              <button onClick={nextScreen} className="text-sm underline opacity-50 font-bold tracking-widest">Skip To Final</button>
            </div>
          </motion.div>
        )}

        {currentScreen === AppScreen.FINAL && (
          <motion.div
            key="final"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col items-center justify-between p-12 text-center"
          >
            <div className="mt-20">
              <h1 className="text-5xl font-black tracking-tighter leading-none mb-2 text-[#f2e6c9]">
                The<br />Drink<br />Støp
              </h1>
              <p className="font-bold tracking-widest uppercase text-xs mt-4 text-[#d4af37]">
                Sip Different.
              </p>
            </div>

            <div className="space-y-4 w-full">
              <div className="bg-[#f2e6c9]/5 p-8 rounded-[2.5rem] border border-[#d4af37]/20 backdrop-blur-sm">
                <CheckCircle size={48} className="mx-auto text-[#d4af37] mb-4" />
                <h2 className="text-2xl font-black">See You Soon 👋</h2>
                <p className="text-sm opacity-60 mt-2">Screenshot This Page To Claim Your Reward!</p>
                <p className="text-xs font-black text-[#d4af37] mt-4 tracking-widest">CODE: TDS10-{uniqueId}</p>
              </div>
            </div>

            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="text-[10px] opacity-30 uppercase tracking-[0.2em] font-black"
            >
              Reset Experience
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
