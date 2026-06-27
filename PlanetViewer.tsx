import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, Float, Ring, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { HumanModel } from './HumanModel';

interface PlanetViewerProps {
  color: string;
  id: string;
  isCinematic: boolean;
  gravityMultiplier: number;
  jumpTrigger: number;
}

export function PlanetViewer({ color, id, isCinematic, gravityMultiplier, jumpTrigger }: PlanetViewerProps) {
  const planetRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  
  useEffect(() => {
    if (isCinematic) {
      gsap.to(camera.position, {
        z: 8,
        y: 2,
        duration: 2,
        ease: "power2.inOut"
      });
    } else {
      gsap.to(camera.position, {
        z: 14,
        y: 0,
        duration: 2,
        ease: "power2.inOut"
      });
    }
  }, [isCinematic, camera]);
  
  // Dynamic material based on planet id
  const planetMaterial = useMemo(() => {
    const isRocky = ['mercury', 'mars', 'earth'].includes(id);
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: isRocky ? 0.9 : 0.4,
      metalness: isRocky ? 0.1 : 0.3,
      wireframe: false,
    });
  }, [color, id]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (planetRef.current) {
      planetRef.current.rotation.y = t * 0.1;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = t * 0.15;
      cloudsRef.current.rotation.x = t * 0.05;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z = t * -0.05;
    }
  });

  const isSaturn = id === 'saturn';
  const hasAtmosphere = ['venus', 'earth', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(id);

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
        <group>
          {/* Core Planet */}
          <Sphere ref={planetRef} args={[3.5, 64, 64]} material={planetMaterial} castShadow receiveShadow>
          </Sphere>

          {/* Clouds / Atmosphere Layer */}
          {hasAtmosphere && (
            <Sphere ref={cloudsRef} args={[3.55, 64, 64]} receiveShadow>
              <MeshDistortMaterial
                color={id === 'venus' ? '#E0B084' : id === 'neptune' ? '#4B70DD' : '#ffffff'}
                transparent
                opacity={id === 'venus' ? 0.6 : 0.15}
                roughness={1}
                distort={0.1}
                speed={1}
              />
            </Sphere>
          )}

          {/* Atmosphere Glow */}
          <Sphere args={[3.8, 32, 32]}>
             <meshBasicMaterial color={color} transparent opacity={0.05} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
          </Sphere>

          {/* Rings for Saturn */}
          {isSaturn && (
            <mesh ref={ringsRef} rotation={[-Math.PI / 2 + 0.3, 0, 0]} receiveShadow castShadow>
              <ringGeometry args={[4.5, 7, 64]} />
              <meshStandardMaterial color="#E8D2A6" transparent opacity={0.8} side={THREE.DoubleSide} roughness={0.6} />
            </mesh>
          )}
          
          {/* Rings for Uranus */}
          {id === 'uranus' && (
            <mesh rotation={[-Math.PI / 2 + 1.5, 0, 0]} receiveShadow>
              <ringGeometry args={[4.8, 5.0, 64]} />
              <meshBasicMaterial color="#7AC5CE" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
          )}

          {/* Human Model appearing on top of the planet during jumpTrigger */}
          {jumpTrigger > 0 && (
             <HumanModel gravityMultiplier={gravityMultiplier} jumpTrigger={jumpTrigger} />
          )}

        </group>
      </Float>
    </group>
  );
}
