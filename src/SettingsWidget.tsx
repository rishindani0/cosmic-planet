import React from 'react';
import { Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SettingsWidget({ 
  realismLevel, 
  setRealismLevel,
  sunBrightness,
  setSunBrightness
}: { 
  realismLevel: number, 
  setRealismLevel: (v: number) => void,
  sunBrightness: number,
  setSunBrightness: (v: number) => void
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-50">
      <motion.div 
        layout
        className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        initial={false}
        animate={{
          width: isOpen ? 240 : 48,
          height: isOpen ? 180 : 48,
        }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      >
        {!isOpen && (
          <motion.button 
            layout="position"
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center w-12 h-12 text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Settings2 className="w-5 h-5" />
          </motion.button>
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 shrink-0">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Settings</span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/50 hover:text-white text-xs uppercase tracking-widest cursor-pointer"
                >
                  Close
                </button>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono text-neutral-400">
                    <span>Performance</span>
                    <span>Realism</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={realismLevel}
                    onChange={(e) => setRealismLevel(Number(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono text-neutral-400">
                    <span>Sun</span>
                    <span>Brightness</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sunBrightness}
                    onChange={(e) => setSunBrightness(Number(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
