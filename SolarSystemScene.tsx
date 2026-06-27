import React, { useRef, useEffect, useState, useMemo, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars, Sparkles, OrbitControls, Html, Trail } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { CELESTIAL_BODIES } from '../data/celestialBodies';
import { CelestialBody } from '../types';
import { EffectComposer, Bloom, ToneMapping, GodRays, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction, Resizer, KernelSize } from 'postprocessing';
import { HumanModel } from './HumanModel';

interface SolarSystemSceneProps {
  mode: 'intro' | 'explore' | 'focus' | 'jump';
  setMode: (mode: 'intro' | 'explore' | 'focus' | 'jump') => void;
  selectedPlanet: CelestialBody | null;
  setSelectedPlanet: (planet: CelestialBody | null) => void;
  realismLevel: number;
  sunBrightness: number;
  jumpGravity?: number;
  onJumpLanded?: () => void;
  triggerJump?: number;
}

const PLANET_DATA: Record<string, { distance: number, size: number, speed: number, initialAngle: number }> = {
  mercury: { distance: 10, size: 0.4, speed: 0.04, initialAngle: Math.random() * Math.PI * 2 },
  venus: { distance: 15, size: 0.8, speed: 0.015, initialAngle: Math.random() * Math.PI * 2 },
  earth: { distance: 22, size: 1, speed: 0.01, initialAngle: Math.random() * Math.PI * 2 },
  mars: { distance: 30, size: 0.5, speed: 0.008, initialAngle: Math.random() * Math.PI * 2 },
  jupiter: { distance: 45, size: 2.5, speed: 0.002, initialAngle: Math.random() * Math.PI * 2 },
  saturn: { distance: 60, size: 2.2, speed: 0.0009, initialAngle: Math.random() * Math.PI * 2 },
  uranus: { distance: 75, size: 1.5, speed: 0.0004, initialAngle: Math.random() * Math.PI * 2 },
  neptune: { distance: 90, size: 1.5, speed: 0.0001, initialAngle: Math.random() * Math.PI * 2 },
};

const Sun = forwardRef<THREE.Mesh, { brightness: number, realismLevel: number }>((props, ref) => {
  const intensity = props.brightness > 0 ? (props.brightness / 100) * 200 : 0;
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[4, props.realismLevel > 80 ? 128 : props.realismLevel > 40 ? 64 : 32, props.realismLevel > 80 ? 128 : props.realismLevel > 40 ? 64 : 32]} />
        <meshBasicMaterial color="#FFFDE8" />
      </mesh>
      {intensity > 0 && (
        <pointLight intensity={intensity} decay={1.5} distance={500} color="#ffffff" castShadow shadow-mapSize={props.realismLevel >= 80 ? [2048, 2048] : props.realismLevel >= 40 ? [1024, 1024] : [512, 512]} shadow-bias={-0.001} />
      )}
      <ambientLight intensity={0.01 + (props.brightness / 100) * 0.05} />
    </group>
  );
});

function PlanetMoons({ parentId, parentSize, realismLevel }: { parentId: string, parentSize: number, realismLevel: number }) {
  const moonsRef = useRef<THREE.Group>(null);
  
  const moonsData = useMemo(() => {
    if (parentId === 'jupiter') {
      return [
        { id: 'io', size: 0.15, distance: parentSize * 1.5, speed: 0.08, color: '#f8d388', initialAngle: Math.random() * Math.PI * 2 },
        { id: 'europa', size: 0.12, distance: parentSize * 1.9, speed: 0.06, color: '#d3c9b6', initialAngle: Math.random() * Math.PI * 2 },
        { id: 'ganymede', size: 0.18, distance: parentSize * 2.4, speed: 0.04, color: '#978572', initialAngle: Math.random() * Math.PI * 2 },
        { id: 'callisto', size: 0.16, distance: parentSize * 2.9, speed: 0.02, color: '#575553', initialAngle: Math.random() * Math.PI * 2 },
      ];
    }
    if (parentId === 'saturn') {
      return [
        { id: 'titan', size: 0.2, distance: parentSize * 2.8, speed: 0.03, color: '#e0b85c', initialAngle: Math.random() * Math.PI * 2 },
        { id: 'enceladus', size: 0.08, distance: parentSize * 1.7, speed: 0.09, color: '#ffffff', initialAngle: Math.random() * Math.PI * 2 },
      ];
    }
    if (parentId === 'earth') {
      return [
        { id: 'moon', size: 0.25, distance: parentSize * 2.5, speed: 0.05, color: '#aaaaaa', initialAngle: Math.random() * Math.PI * 2 },
      ];
    }
    return [];
  }, [parentId, parentSize]);

  useFrame((state, delta) => {
    if (!moonsRef.current) return;
    const safeDelta = Math.min(delta, 0.1);
    
    moonsRef.current.children.forEach((child, index) => {
      const data = moonsData[index];
      if (!data) return;
      if (child.userData.angle === undefined) {
        child.userData.angle = data.initialAngle;
      }
      child.userData.angle += data.speed * (safeDelta * 60);
      child.position.x = Math.cos(child.userData.angle) * data.distance;
      child.position.z = Math.sin(child.userData.angle) * data.distance;
    });
  });

  if (moonsData.length === 0) return null;

  return (
    <group ref={moonsRef}>
      {moonsData.map((moon) => (
        <mesh key={moon.id} castShadow receiveShadow>
          <sphereGeometry args={[moon.size, realismLevel > 80 ? 64 : realismLevel > 40 ? 32 : 16, realismLevel > 80 ? 64 : realismLevel > 40 ? 32 : 16]} />
          <meshStandardMaterial color={moon.color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function PlanetMesh({ 
  body, 
  data, 
  onClick, 
  isFocused,
  onPositionUpdate,
  realismLevel,
  isJumpMode,
  jumpTrigger,
  onJumpLanded,
  jumpCameraReady,
  sharedHumanRef
}: { 
  body: CelestialBody, 
  data: { distance: number, size: number, speed: number, initialAngle: number }, 
  onClick: (body: CelestialBody, position: THREE.Vector3) => void,
  isFocused: boolean,
  onPositionUpdate: (id: string, position: THREE.Vector3) => void,
  realismLevel: number,
  isJumpMode?: boolean,
  jumpTrigger?: number,
  onJumpLanded?: () => void,
  jumpCameraReady?: boolean,
  sharedHumanRef?: React.MutableRefObject<any>
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(data.initialAngle);
  const [internalJumpTrigger, setInternalJumpTrigger] = useState(0);
  const localHumanRef = useRef<any>(null);
  const humanRef = sharedHumanRef || localHumanRef;
  const isFirstJump = useRef(true);

  useEffect(() => {
    if (!isJumpMode) {
      isFirstJump.current = true;
    }
  }, [isJumpMode]);

  const landingPadRef = useRef<THREE.MeshBasicMaterial>(null);
  const landingRingRef = useRef<THREE.MeshBasicMaterial>(null);

  useEffect(() => {
    if (isFocused && isJumpMode && jumpCameraReady) {
      if (isFirstJump.current) {
        if (humanRef.current) humanRef.current.fadeIn();
        if (landingPadRef.current) gsap.to(landingPadRef.current, { opacity: 0.1, duration: 1 });
        if (landingRingRef.current) gsap.to(landingRingRef.current, { opacity: 1, duration: 1 });
        const timer = setTimeout(() => {
          setInternalJumpTrigger(Date.now());
          isFirstJump.current = false;
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setInternalJumpTrigger(Date.now());
      }
    }
  }, [isFocused, isJumpMode, jumpCameraReady, jumpTrigger]);

  useEffect(() => {
    const handleClose = () => {
      if (humanRef.current) humanRef.current.fadeOut();
      if (landingPadRef.current) gsap.to(landingPadRef.current, { opacity: 0, duration: 1 });
      if (landingRingRef.current) gsap.to(landingRingRef.current, { opacity: 0, duration: 1 });
    };
    window.addEventListener('jump-close', handleClose);
    return () => window.removeEventListener('jump-close', handleClose);
  }, []);

  const onBeforeCompile = useMemo(() => (shader: any) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      #include <dithering_fragment>
      float lum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
      float darkFactor = 1.0 - smoothstep(0.0, 0.05, lum);
      vec3 nightTint = vec3(0.02, 0.04, 0.1);
      gl_FragColor.rgb += nightTint * darkFactor;
      `
    );
  }, []);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.1);
    if (groupRef.current) {
      angleRef.current += data.speed * (safeDelta * 60);
      const x = Math.cos(angleRef.current) * data.distance;
      const z = Math.sin(angleRef.current) * data.distance;
      groupRef.current.position.set(x, 0, z);
      
      onPositionUpdate(body.id, groupRef.current.position);
    }
    
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.distance - 0.05, data.distance + 0.05, 64]} />
        <meshBasicMaterial color={hovered ? body.color : "#ffffff"} opacity={hovered ? 0.5 : 0.05} transparent side={THREE.DoubleSide} />
      </mesh>
      
      <group ref={groupRef}>
        <mesh 
          ref={meshRef} 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
          onClick={(e) => {
            e.stopPropagation();
            if (groupRef.current) {
              const worldPos = new THREE.Vector3();
              groupRef.current.getWorldPosition(worldPos);
              onClick(body, worldPos);
            }
          }}
        >
          <sphereGeometry args={[data.size, realismLevel > 80 ? 128 : realismLevel > 40 ? 64 : 32, realismLevel > 80 ? 128 : realismLevel > 40 ? 64 : 32]} />
          <meshStandardMaterial 
            color={body.color} 
            roughness={0.8}
            metalness={0.2}
            emissive={hovered ? body.color : "#000000"}
            emissiveIntensity={hovered ? 0.3 : 0}
            onBeforeCompile={onBeforeCompile}
          />
        </mesh>
        
        {body.id === 'saturn' && (
          <mesh rotation={[-Math.PI / 2.5, 0, 0]} receiveShadow castShadow>
            <ringGeometry args={[data.size * 1.4, data.size * 2.2, 64]} />
            <meshStandardMaterial color="#E8D2A6" side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
        )}

        {hovered && !isFocused && (
          <Html position={[0, data.size + 1, 0]} center style={{ pointerEvents: 'none' }}>
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white font-mono text-xs uppercase tracking-widest whitespace-nowrap shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              {body.name}
            </div>
          </Html>
        )}

        <PlanetMoons parentId={body.id} parentSize={data.size} realismLevel={realismLevel} />

        {isFocused && isJumpMode && (
          <group position={[0, data.size, 0]}>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[data.size * 0.3, 32]} />
              <meshBasicMaterial ref={landingPadRef} color="#ffffff" opacity={0} transparent side={THREE.DoubleSide} />
              <mesh position={[0, 0, -0.01]}>
                <ringGeometry args={[data.size * 0.28, data.size * 0.3, 32]} />
                <meshBasicMaterial ref={landingRingRef} color={body.color} transparent opacity={0} />
              </mesh>
            </mesh>
            
            <group position={[0, 0, 0]} scale={[0.1, 0.1, 0.1]}>
               <HumanModel ref={humanRef} gravityMultiplier={body.relativeGravity} jumpTrigger={internalJumpTrigger} onLanded={onJumpLanded} color={body.color} />
            </group>
          </group>
        )}
      </group>
    </>
  );
}

function AsteroidBelt({ realismLevel }: { realismLevel: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const maxCount = 2500;
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  useEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < maxCount; i++) {
        const radius = 33 + Math.random() * 8; // Between Mars(30) and Jupiter(45)
        const theta = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * (Math.random() > 0.5 ? 1 : -1) * Math.random() * 3;
        
        dummy.position.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        const scale = 0.02 + Math.random() * 0.08;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []); // Only run once to set up all possible instances
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y -= 0.01 * delta;
      const displayCount = Math.max(0, Math.floor(maxCount * (realismLevel / 100)));
      meshRef.current.count = displayCount;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxCount]} castShadow receiveShadow>
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#888888" roughness={0.9} />
    </instancedMesh>
  );
}

function DynamicPostProcessing({ mode, selectedPlanet, planetPositions, sunMesh, realismLevel, sunBrightness }: any) {
  const dofRef = useRef<any>(null);
  const [targetVec] = useState(() => new THREE.Vector3());

  useFrame((state, delta) => {
    if (dofRef.current) {
      const isFocus = mode === 'focus' && selectedPlanet;
      const targetBokeh = isFocus ? 5.0 : 0.0;
      // Clamp delta to prevent huge jumps if tab was inactive
      const safeDelta = Math.min(delta, 0.1);
      
      dofRef.current.bokehScale = THREE.MathUtils.lerp(dofRef.current.bokehScale, targetBokeh, safeDelta * 3);
      
      if (isFocus) {
        const pos = planetPositions.current[selectedPlanet.id];
        if (pos) {
          targetVec.lerp(pos, safeDelta * 4);
        }
      } else {
        targetVec.lerp(new THREE.Vector3(0, 0, 0), safeDelta * 2);
      }
    }
  });

  const samples = Math.max(10, Math.floor(60 * (realismLevel / 100)));

  if (realismLevel < 20) return null;

  return (
    <EffectComposer multisampling={0}>
      {realismLevel >= 50 && (
        <DepthOfField
          ref={dofRef}
          target={targetVec}
          focusDistance={0.0}
          focalLength={0.01}
          bokehScale={0}
          height={480}
        />
      )}
      <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5 * (realismLevel / 100) * (sunBrightness / 100)} />
      {realismLevel >= 30 && sunBrightness > 0 && (
        <GodRays
          sun={sunMesh}
          blendFunction={BlendFunction.SCREEN}
          samples={samples}
          density={0.96 * (realismLevel / 100) * (sunBrightness / 100)}
          decay={0.9}
          weight={0.4 * (realismLevel / 100) * (sunBrightness / 100)}
          exposure={0.6 * (realismLevel / 100) * (sunBrightness / 100)}
          clampMax={1}
          kernelSize={KernelSize.SMALL}
          blur={true}
        />
      )}
      <ToneMapping />
    </EffectComposer>
  );
}

export function SolarSystemScene({ 
  mode, 
  setMode, 
  selectedPlanet, 
  setSelectedPlanet, 
  realismLevel, 
  sunBrightness,
  jumpGravity,
  onJumpLanded,
  triggerJump
}: SolarSystemSceneProps) {
  const { camera, scene } = useThree();
  const controlsRef = useRef<any>(null);
  const planetPositions = useRef<Record<string, THREE.Vector3>>({});
  const [sunMesh, setSunMesh] = useState<THREE.Mesh | null>(null);
  const [jumpCameraReady, setJumpCameraReady] = useState(false);
  const activeHumanRef = useRef<any>(null);

  const transitionState = useRef({ 
    active: false, 
    progress: 0, 
    sourceCam: new THREE.Vector3(), 
    sourceTarget: new THREE.Vector3(),
    duration: 2.0
  });
  const lastTargetPos = useRef(new THREE.Vector3());

  // Setup initial camera
  useEffect(() => {
    if (mode === 'intro') {
      camera.position.set(0, 150, 0);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.enabled = false;
      }
    }
    if (mode !== 'jump') {
      setJumpCameraReady(false);
    }
  }, [mode, camera]);

  // Trigger Transitions
  useEffect(() => {
    if ((mode === 'focus' || mode === 'jump') && selectedPlanet) {
      if (controlsRef.current) {
        transitionState.current = {
          active: true,
          progress: 0,
          sourceCam: camera.position.clone(),
          sourceTarget: controlsRef.current.target.clone(),
          duration: mode === 'jump' ? 2.5 : 2.5
        };
        controlsRef.current.enabled = false;
        controlsRef.current.enableDamping = false;
        if (mode === 'jump') setJumpCameraReady(false);
      }
    } else if (mode === 'explore') {
      if (controlsRef.current) {
        transitionState.current = {
          active: true,
          progress: 0,
          sourceCam: camera.position.clone(),
          sourceTarget: controlsRef.current.target.clone(),
          duration: selectedPlanet ? 2.5 : 4.0
        };
        controlsRef.current.enabled = false;
        controlsRef.current.enableDamping = false;
      }
    }
  }, [mode, selectedPlanet]);

  // Handle continuous tracking and transitions
  useFrame((state, delta) => {
    if (transitionState.current.active) {
      transitionState.current.progress += delta / transitionState.current.duration;
      const p = Math.min(transitionState.current.progress, 1);
      // easeInOutCubic
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

      let destCam = new THREE.Vector3(40, 20, 80);
      let destTarget = new THREE.Vector3(0, 0, 0);
      
      if ((mode === 'focus' || mode === 'jump') && selectedPlanet) {
        const pos = planetPositions.current[selectedPlanet.id];
        const data = PLANET_DATA[selectedPlanet.id];
        if (pos && data) {
          if (mode === 'jump') {
            const humanY = activeHumanRef.current ? activeHumanRef.current.getPositionY() : 0.8;
            const maxJump = (2 / Math.max(0.1, selectedPlanet.relativeGravity)) * 0.1;
            
            const camDistZ = Math.max(0.6, maxJump * 1.5);
            const camPosY = data.size + 0.1 + (humanY * 0.1) + (maxJump * 0.1);
            
            const offset = new THREE.Vector3(0.3, camPosY, camDistZ);
            destCam = pos.clone().add(offset);
            destTarget = pos.clone().add(new THREE.Vector3(0, data.size + (humanY * 0.1), 0));
          } else {
            const offset = new THREE.Vector3(data.size * 3, data.size * 1.5, data.size * 4);
            destCam = pos.clone().add(offset);
            destTarget = pos.clone();
          }
        }
      }

      camera.position.lerpVectors(transitionState.current.sourceCam, destCam, ease);
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(transitionState.current.sourceTarget, destTarget, ease);
        controlsRef.current.update();
      }

      if (p >= 1) {
        transitionState.current.active = false;
        if (controlsRef.current) {
          controlsRef.current.enabled = mode !== 'jump';
          controlsRef.current.enableDamping = true;
        }
        if (mode === 'focus' && selectedPlanet) {
          const pos = planetPositions.current[selectedPlanet.id];
          if (pos) lastTargetPos.current.copy(pos);
        } else if (mode === 'jump' && selectedPlanet) {
          const pos = planetPositions.current[selectedPlanet.id];
          const data = PLANET_DATA[selectedPlanet.id];
          const humanY = activeHumanRef.current ? activeHumanRef.current.getPositionY() : 0.8;
          if (pos && data) lastTargetPos.current.copy(pos).add(new THREE.Vector3(0, data.size + (humanY * 0.1), 0));
          setJumpCameraReady(true);
        } else {
          lastTargetPos.current.set(0, 0, 0);
        }
      }
    } else {
      // Continuous tracking of moving planet
      if ((mode === 'focus' || mode === 'jump') && selectedPlanet && controlsRef.current) {
        const currentPos = planetPositions.current[selectedPlanet.id];
        const data = PLANET_DATA[selectedPlanet.id];
        if (currentPos && data) {
          
          let currentTargetWorldPos = currentPos.clone();
          if (mode === 'jump') {
            const humanY = activeHumanRef.current ? activeHumanRef.current.getPositionY() : 0.8;
            currentTargetWorldPos.add(new THREE.Vector3(0, data.size + (humanY * 0.1), 0));
          }
          
          // Calculate how much the target moved this frame
          const deltaTarget = currentTargetWorldPos.clone().sub(lastTargetPos.current);
          
          // Move the camera's target to the exact position
          controlsRef.current.target.copy(currentTargetWorldPos);
          
          // And also shift the camera position by the same delta so OrbitControls stays relative
          camera.position.add(deltaTarget);
          
          lastTargetPos.current.copy(currentTargetWorldPos);
        }
      }
    }
  });

  const handlePlanetClick = (body: CelestialBody, position: THREE.Vector3) => {
    if (mode === 'focus' && selectedPlanet?.id === body.id) return;
    setSelectedPlanet(body);
    setMode('focus');
  };

  const updatePlanetPosition = (id: string, position: THREE.Vector3) => {
    planetPositions.current[id] = position.clone();
  };

  return (
    <>
      <color attach="background" args={['#000000']} />
      
      <Sun ref={setSunMesh} brightness={sunBrightness} realismLevel={realismLevel} />
      
      {CELESTIAL_BODIES.filter(b => b.id !== 'earth-moon').map(body => (
        <PlanetMesh 
          key={body.id} 
          body={body} 
          data={PLANET_DATA[body.id]} 
          onClick={handlePlanetClick}
          isFocused={selectedPlanet?.id === body.id}
          onPositionUpdate={updatePlanetPosition}
          realismLevel={realismLevel}
          isJumpMode={mode === 'jump'}
          jumpTrigger={triggerJump}
          onJumpLanded={onJumpLanded}
          jumpCameraReady={jumpCameraReady}
          sharedHumanRef={selectedPlanet?.id === body.id ? activeHumanRef : undefined}
        />
      ))}
      
      <group>
        <Stars radius={300} depth={50} count={realismLevel > 20 ? 8000 : 1500} factor={2} saturation={0} fade speed={0.5} />
        {realismLevel > 30 && (
          <Stars radius={200} depth={50} count={3000} factor={4} saturation={0.8} fade speed={1} />
        )}
      </group>
      
      {realismLevel > 40 && (
        <group>
          <Sparkles count={200} scale={250} size={2} speed={0.1} opacity={0.1 * (realismLevel / 100)} color="#445588" />
          <Sparkles count={200} scale={250} size={2} speed={0.1} opacity={0.1 * (realismLevel / 100)} color="#885544" />
        </group>
      )}
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        maxDistance={200}
        minDistance={2}
      />
      
      <AsteroidBelt realismLevel={realismLevel} />

      {sunMesh && (
        <DynamicPostProcessing 
          mode={mode}
          selectedPlanet={selectedPlanet}
          planetPositions={planetPositions}
          sunMesh={sunMesh}
          realismLevel={realismLevel}
          sunBrightness={sunBrightness}
        />
      )}
    </>
  );
}
