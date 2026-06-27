import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CelestialBody } from '../types';
import { X, ChevronLeft, ChevronRight, Activity, Weight, Info, Globe2 } from 'lucide-react';
import { CELESTIAL_BODIES } from '../data/celestialBodies';

interface PlanetPanelProps {
  planet: CelestialBody;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJump: (weight: number, gravity: number) => void;
}

export function PlanetPanel({ planet, onClose, onPrev, onNext, onJump }: PlanetPanelProps) {
  const [calculating, setCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [earthWeight, setEarthWeight] = useState('70');
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Reset state when planet changes
    setCalculating(false);
    setShowResult(false);
    setStep(0);
  }, [planet.id]);

  const handleCalculate = () => {
    setCalculating(true);
    setStep(1); // Earth gravity
    
    setTimeout(() => setStep(2), 1000); // Planet gravity
    setTimeout(() => setStep(3), 2000); // Formula
    setTimeout(() => {
      setCalculating(false);
      setShowResult(true);
    }, 3500);
  };

  const parsedWeight = parseFloat(earthWeight) || 0;
  const planetWeight = (parsedWeight * planet.relativeGravity).toFixed(1);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, x: 50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute right-4 left-4 md:left-auto md:right-8 top-1/2 -translate-y-1/2 w-auto md:w-96 max-h-[85vh] overflow-y-auto hide-scrollbar z-40 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        style={{
          boxShadow: `0 10px 40px -10px ${planet.color}40, inset 0 0 20px -10px ${planet.color}30`
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-wider mb-1 font-display" style={{ color: planet.color, textShadow: `0 0 20px ${planet.color}40` }}>
              {planet.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-widest font-mono">
              <Globe2 className="w-3 h-3" />
              <span>{planet.type}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!calculating && !showResult && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-1">Gravity</div>
                <div className="text-lg font-bold text-white/90">{planet.gravity} m/s²</div>
              </div>
              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-1">Temp</div>
                <div className="text-lg font-bold text-white/90">{planet.temperature}</div>
              </div>
            </div>

            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                  {planet.fact}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-neutral-400 uppercase tracking-widest font-mono pl-1">
                Enter Earth Weight (kg)
              </label>
              <div className="relative">
                <input 
                  type="number"
                  value={earthWeight}
                  onChange={(e) => setEarthWeight(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-2xl font-bold text-white focus:outline-none focus:border-white/30 transition-colors"
                />
                <Weight className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={!parsedWeight || parsedWeight <= 0}
              className="w-full py-4 rounded-xl font-bold tracking-widest uppercase text-sm transition-all relative overflow-hidden group"
              style={{
                backgroundColor: `${planet.color}20`,
                color: planet.color,
                border: `1px solid ${planet.color}40`
              }}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              Calculate Weight
            </button>
          </motion.div>
        )}

        {calculating && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 space-y-8 min-h-[300px]"
          >
            <Activity className="w-12 h-12 animate-pulse" style={{ color: planet.color }} />
            <div className="space-y-4 w-full font-mono text-xs uppercase tracking-widest text-neutral-400">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: step >= 1 ? 1 : 0 }} className="flex justify-between">
                <span>Earth Gravity:</span>
                <span className="text-white">9.81 m/s²</span>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: step >= 2 ? 1 : 0 }} className="flex justify-between">
                <span>{planet.name} Gravity:</span>
                <span style={{ color: planet.color }}>{planet.gravity} m/s²</span>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: step >= 3 ? 1 : 0 }} className="flex justify-between border-t border-white/10 pt-4">
                <span>Multiplier:</span>
                <span className="text-white">x{planet.relativeGravity.toFixed(2)}</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {showResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Your Weight on {planet.name}</div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-6xl font-black font-display tracking-tighter"
                style={{ color: planet.color, textShadow: `0 0 30px ${planet.color}50` }}
              >
                {planetWeight} <span className="text-2xl text-white/50">kg</span>
              </motion.div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="text-center">
              <div className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-1">Earth Equivalent</div>
              <div className="text-xl font-bold text-white/80">{parsedWeight} kg</div>
            </div>

            <button
              onClick={() => onJump(parsedWeight, planet.gravity)}
              className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-bold uppercase tracking-widest relative overflow-hidden group"
              style={{
                backgroundColor: `${planet.color}20`,
                color: planet.color,
                border: `1px solid ${planet.color}40`
              }}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              Jump
            </button>
          </motion.div>
        )}

        <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
          <button 
            onClick={onPrev}
            className="p-2 hover:bg-white/10 rounded-full transition-colors group flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4 text-white/50 group-hover:text-white" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/50 group-hover:text-white">Prev</span>
          </button>
          <button 
            onClick={onNext}
            className="p-2 hover:bg-white/10 rounded-full transition-colors group flex items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/50 group-hover:text-white">Next</span>
            <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
