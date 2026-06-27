import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CELESTIAL_BODIES } from '../data/celestialBodies';
import { CelestialBody } from '../types';
import { Globe } from 'lucide-react';

interface PlanetSelectorWidgetProps {
  selectedPlanet: CelestialBody | null;
  onSelect: (planet: CelestialBody) => void;
}

export function PlanetSelectorWidget({ selectedPlanet, onSelect }: PlanetSelectorWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-50">
      <motion.div 
        layout
        className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        initial={false}
        animate={{
          width: isOpen ? 240 : 'auto',
          height: isOpen ? 360 : 48,
          borderRadius: isOpen ? 24 : 24
        }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      >
        {!isOpen && (
          <motion.button 
            layout="position"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-6 h-12 text-sm font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>Select Planet</span>
          </motion.button>
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Destinations</span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/50 hover:text-white text-xs uppercase tracking-widest cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto hide-scrollbar p-2">
                {CELESTIAL_BODIES.filter(b => b.id !== 'earth-moon').map(planet => (
                  <button
                    key={planet.id}
                    onClick={() => {
                      onSelect(planet);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl mb-1 transition-colors flex items-center gap-3 cursor-pointer ${
                      selectedPlanet?.id === planet.id ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: planet.color, boxShadow: `0 0 10px ${planet.color}` }} />
                    <span className="text-sm font-bold tracking-wider uppercase text-white/90 truncate">{planet.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
