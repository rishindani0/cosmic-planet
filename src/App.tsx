import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { SolarSystemScene } from './SolarSystemScene';
import { PlanetPanel } from './PlanetPanel';
import PlanetSelectorWidget from './PlanetSelectorWidget';
import { SettingsWidget } from './SettingsWidget';
import { AudioController } from './AudioController';
import { CELESTIAL_BODIES } from './data/celestialBodies';
import { CelestialBody } from './types';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<'intro' | 'explore' | 'focus' | 'jump'>('intro');
  const [selectedPlanet, setSelectedPlanet] = useState<CelestialBody | null>(null);
  const [dpr, setDpr] = useState(1);
  const [realismLevel, setRealismLevel] = useState(100);
  const [sunBrightness, setSunBrightness] = useState(100);
  const [jumpParams, setJumpParams] = useState({ weight: 70, gravity: 9.81 });
  const [showJumpUI, setShowJumpUI] = useState(false);
  const [triggerJump, setTriggerJump] = useState(0);

  const handleNextPlanet = () => {
    if (!selectedPlanet) return;
    const currentIndex = CELESTIAL_BODIES.findIndex(p => p.id === selectedPlanet.id);
    const nextIndex = (currentIndex + 1) % CELESTIAL_BODIES.length;
    let nextPlanet = CELESTIAL_BODIES[nextIndex];
    if (nextPlanet.id === 'earth-moon') nextPlanet = CELESTIAL_BODIES[(nextIndex + 1) % CELESTIAL_BODIES.length];
    setSelectedPlanet(nextPlanet);
  };

  const handlePrevPlanet = () => {
    if (!selectedPlanet) return;
    const currentIndex = CELESTIAL_BODIES.findIndex(p => p.id === selectedPlanet.id);
    const prevIndex = (currentIndex - 1 + CELESTIAL_BODIES.length) % CELESTIAL_BODIES.length;
    let prevPlanet = CELESTIAL_BODIES[prevIndex];
    if (prevPlanet.id === 'earth-moon') prevPlanet = CELESTIAL_BODIES[(prevIndex - 1 + CELESTIAL_BODIES.length) % CELESTIAL_BODIES.length];
    setSelectedPlanet(prevPlanet);
  };

  const returnToExplore = () => {
    setMode('explore');
    setSelectedPlanet(null);
  };

  return (
    <div className="relative w-full h-screen bg-[#030508] text-white overflow-hidden font-sans selection:bg-white/20">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows={realismLevel >= 40} dpr={dpr} camera={{ position: [0, 150, 0], fov: 45 }}>
          <PerformanceMonitor 
            onIncline={() => setDpr(1.5)} 
            onDecline={() => setDpr(0.75)} 
          />
          <AudioController />
          <SolarSystemScene 
            mode={mode} 
            setMode={setMode}
            selectedPlanet={selectedPlanet} 
            setSelectedPlanet={setSelectedPlanet} 
            realismLevel={realismLevel}
            sunBrightness={sunBrightness}
            jumpGravity={jumpParams.gravity}
            onJumpLanded={() => {
              setTimeout(() => {
                setShowJumpUI(true);
              }, 500);
            }}
            triggerJump={triggerJump}
          />
        </Canvas>
      </div>

      {/* Intro Overlay */}
      <AnimatePresence>
        {mode === 'intro' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div className="text-center space-y-8">
              <div>
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                  className="text-5xl md:text-7xl font-black uppercase tracking-[0.3em] font-display"
                >
                  Cosmo Grams
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                  className="mt-4 text-sm md:text-base text-neutral-400 uppercase tracking-widest font-mono"
                >
                  Interactive Planetary Weight Calculator
                </motion.p>
              </div>

              <motion.button
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
                onClick={() => setMode('explore')}
                className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-neutral-200 transition-colors rounded-full relative overflow-hidden group cursor-pointer"
              >
                <span className="relative z-10">Enter the Solar System</span>
                <div className="absolute inset-0 bg-white shadow-[0_0_30px_rgba(255,255,255,0.5)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explore Mode UI HUD */}
      <AnimatePresence>
        {mode === 'explore' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 3 }} // Wait for camera anim
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <div className="absolute top-4 left-4 md:top-8 md:left-8">
              <h2 className="text-xl font-bold uppercase tracking-[0.2em] font-display text-white/50">Solar System</h2>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mt-1">Select a celestial body</p>
            </div>
            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-4 md:gap-8 text-[10px] uppercase tracking-widest font-mono text-neutral-500 bg-black/40 px-4 py-2 md:px-6 md:py-3 rounded-full backdrop-blur-md border border-white/5">
              <span>Scroll: Zoom</span>
              <span>Drag: Rotate</span>
              <span>Click: Select</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {(mode === 'focus' || mode === 'jump') && selectedPlanet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mode === 'jump' ? 0 : 1 }}
            exit={{ opacity: 0 }}
            style={{ pointerEvents: mode === 'jump' ? 'none' : 'auto' }}
            className="absolute inset-0 z-40"
          >
            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50 pointer-events-auto">
              <button 
                onClick={returnToExplore}
                className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-colors group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                <span className="text-xs uppercase tracking-widest font-bold text-neutral-400 group-hover:text-white transition-colors">Return to System</span>
              </button>
            </div>

            <PlanetPanel 
              planet={selectedPlanet} 
              onClose={returnToExplore}
              onPrev={handlePrevPlanet}
              onNext={handleNextPlanet}
              onJump={(weight, gravity) => {
                setJumpParams({ weight, gravity });
                setMode('jump');
                setShowJumpUI(false);
                setTriggerJump(Date.now());
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jump Mode UI */}
      <AnimatePresence>
        {mode === 'jump' && showJumpUI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 pointer-events-auto"
          >
            <button
              onClick={() => {
                setShowJumpUI(false);
                setTriggerJump(Date.now());
              }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full font-bold uppercase tracking-widest text-sm transition-all"
            >
              Jump Again
            </button>
            <button
              onClick={() => {
                setShowJumpUI(false);
                // Dispatch a custom event to trigger fade out in 3D
                window.dispatchEvent(new CustomEvent('jump-close'));
                setTimeout(() => {
                  setMode('focus');
                }, 1000);
              }}
              className="px-6 py-3 bg-white text-black hover:bg-neutral-200 backdrop-blur-md rounded-full font-bold uppercase tracking-widest text-sm transition-all"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(mode === 'explore' || mode === 'focus') && (
          <>
            <PlanetSelectorWidget 
              selectedPlanet={selectedPlanet}
              onSelect={(planet) => {
                setSelectedPlanet(planet);
                setMode('focus');
              }}
            />
            <SettingsWidget 
              realismLevel={realismLevel} 
              setRealismLevel={setRealismLevel}
              sunBrightness={sunBrightness}
              setSunBrightness={setSunBrightness}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
