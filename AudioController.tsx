import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function AudioController() {
  const { camera } = useThree();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    // We only create audio context after user interaction, but since we want this to just run
    // we'll attempt to start it, and if the browser blocks it, it'll resume when they click.
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0; // start silent
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200; // Deep space rumble
    filter.connect(masterGain);
    filterNodeRef.current = filter;

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55; // Low hum
    osc1.connect(filter);
    osc1.start();
    osc1Ref.current = osc1;

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = 56.5; // Slightly detuned for beating effect
    osc2.connect(filter);
    osc2.start();
    osc2Ref.current = osc2;

    const handleInteract = () => {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    };
    window.addEventListener('click', handleInteract);

    return () => {
      window.removeEventListener('click', handleInteract);
      osc1.stop();
      osc2.stop();
      ctx.close();
    };
  }, []);

  useFrame(() => {
    if (!audioCtxRef.current || !gainNodeRef.current || !filterNodeRef.current || !osc1Ref.current || !osc2Ref.current) return;

    // Modulate based on distance to the sun (0,0,0)
    const distanceToSun = camera.position.length();
    
    // Normalize distance (e.g. 10 to 150)
    const minDistance = 10;
    const maxDistance = 150;
    
    let normalizedDist = (distanceToSun - minDistance) / (maxDistance - minDistance);
    normalizedDist = THREE.MathUtils.clamp(normalizedDist, 0, 1);

    // Volume ranges from 0.05 (far) to 0.3 (close)
    const targetVolume = THREE.MathUtils.lerp(0.3, 0.05, normalizedDist);
    // Filter frequency ranges from 150Hz (far) to 600Hz (close)
    const targetFilterFreq = THREE.MathUtils.lerp(600, 150, normalizedDist);
    
    // Pitch (frequency) ranges from 55Hz (far) to 65Hz (close)
    const targetOsc1Freq = THREE.MathUtils.lerp(65, 55, normalizedDist);
    const targetOsc2Freq = targetOsc1Freq * 1.02; // keeping the beating detune

    const currentVolume = gainNodeRef.current.gain.value;
    const currentFilterFreq = filterNodeRef.current.frequency.value;
    const currentOsc1Freq = osc1Ref.current.frequency.value;
    const currentOsc2Freq = osc2Ref.current.frequency.value;

    // Smooth transitions
    gainNodeRef.current.gain.value = THREE.MathUtils.lerp(currentVolume, targetVolume, 0.05);
    filterNodeRef.current.frequency.value = THREE.MathUtils.lerp(currentFilterFreq, targetFilterFreq, 0.05);
    osc1Ref.current.frequency.value = THREE.MathUtils.lerp(currentOsc1Freq, targetOsc1Freq, 0.05);
    osc2Ref.current.frequency.value = THREE.MathUtils.lerp(currentOsc2Freq, targetOsc2Freq, 0.05);
  });

  return null;
}
