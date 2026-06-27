import { useRef, useEffect, forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

interface HumanModelProps {
  gravityMultiplier: number;
  jumpTrigger: number;
  onLanded?: () => void;
  color?: string;
}

export const HumanModel = forwardRef(({ gravityMultiplier, jumpTrigger, onLanded, color = '#e0e0e0' }: HumanModelProps, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  // Material for the human
  const [material] = useState(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.8,
    metalness: 0.2,
    transparent: true,
    opacity: 0,
  }));

  useImperativeHandle(ref, () => ({
    fadeIn: () => {
      gsap.to(material, { opacity: 1, duration: 1 });
    },
    fadeOut: () => {
      gsap.to(material, { opacity: 0, duration: 1 });
    },
    getPositionY: () => {
      return groupRef.current ? groupRef.current.position.y : 0.8;
    }
  }));

  useEffect(() => {
    material.color.set(color);
  }, [color, material]);

  // Idle animation
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Idle breathing (slight scaling of body and up/down movement of head)
    if (bodyRef.current && headRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(t * 2) * 0.02;
      headRef.current.position.y = 1.6 + Math.sin(t * 2) * 0.05;
      
      // Slight arm sway
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.z = 0.2 + Math.sin(t * 1.5) * 0.05;
        rightArmRef.current.rotation.z = -0.2 - Math.sin(t * 1.5) * 0.05;
      }
    }
  });

  // Jump animation
  useEffect(() => {
    if (jumpTrigger > 0 && groupRef.current) {
      // Calculate jump parameters based on gravity
      // High gravity = short jump, fast
      // Low gravity = high jump, slow
      const jumpHeight = 2 / Math.max(0.1, gravityMultiplier);
      const jumpDuration = 0.5 / Math.max(0.3, Math.sqrt(gravityMultiplier));
      
      const tl = gsap.timeline({
        onComplete: () => {
          if (onLanded) onLanded();
        }
      });
      
      // Squat
      tl.to(groupRef.current.position, {
        y: 0.5, // scale down
        duration: 0.2,
        ease: "power2.out",
      }, 0);
      tl.to(groupRef.current.scale, {
        y: 0.8,
        x: 1.1,
        z: 1.1,
        duration: 0.2,
        ease: "power2.out",
      }, 0);

      // Jump up
      tl.to(groupRef.current.position, {
        y: 0.8 + jumpHeight,
        duration: jumpDuration,
        ease: "power2.out",
      });
      tl.to(groupRef.current.scale, {
        y: 1.1,
        x: 0.95,
        z: 0.95,
        duration: jumpDuration * 0.5,
        ease: "power2.out",
      }, "<");
      tl.to(groupRef.current.scale, {
        y: 1,
        x: 1,
        z: 1,
        duration: jumpDuration * 0.5,
        ease: "power2.in",
      }, `>-${jumpDuration * 0.5}`);

      // Fall down
      tl.to(groupRef.current.position, {
        y: 0.8,
        duration: jumpDuration,
        ease: "power2.in",
      });

      // Impact squat
      tl.to(groupRef.current.position, {
        y: 0.6,
        duration: 0.15,
        ease: "power1.out",
      });
      tl.to(groupRef.current.scale, {
        y: 0.85,
        x: 1.05,
        z: 1.05,
        duration: 0.15,
        ease: "power1.out",
      }, "<");

      // Recover to idle
      tl.to(groupRef.current.position, {
        y: 0.8,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)",
      });
      tl.to(groupRef.current.scale, {
        y: 1,
        x: 1,
        z: 1,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)",
      }, "<");

      // Arm animation during jump
      if (leftArmRef.current && rightArmRef.current) {
        gsap.to([leftArmRef.current.rotation, rightArmRef.current.rotation], {
          x: -Math.PI * 0.8,
          duration: jumpDuration,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
        });
      }
      
      // Leg animation during jump (tuck)
      if (leftLegRef.current && rightLegRef.current) {
        gsap.to([leftLegRef.current.position, rightLegRef.current.position], {
          y: 0.5,
          duration: jumpDuration,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
        });
        gsap.to([leftLegRef.current.rotation, rightLegRef.current.rotation], {
          x: -Math.PI * 0.2,
          duration: jumpDuration,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
        });
      }
    }
  }, [jumpTrigger, gravityMultiplier]);

  return (
    <group ref={groupRef} position={[0, 0.8, 0]}>
      {/* Head */}
      <Sphere ref={headRef} args={[0.25, 16, 16]} position={[0, 1.6, 0]} castShadow receiveShadow>
        <primitive object={material} attach="material" />
      </Sphere>

      {/* Body */}
      <Box ref={bodyRef} args={[0.6, 1.2, 0.3]} position={[0, 0.9, 0]} castShadow receiveShadow>
        <primitive object={material} attach="material" />
      </Box>

      {/* Left Arm */}
      <group position={[-0.45, 1.4, 0]}>
        <Cylinder ref={leftArmRef} args={[0.1, 0.08, 1, 16]} position={[0, -0.4, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
          <primitive object={material} attach="material" />
        </Cylinder>
      </group>

      {/* Right Arm */}
      <group position={[0.45, 1.4, 0]}>
        <Cylinder ref={rightArmRef} args={[0.1, 0.08, 1, 16]} position={[0, -0.4, 0]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
          <primitive object={material} attach="material" />
        </Cylinder>
      </group>

      {/* Left Leg */}
      <group position={[-0.15, 0.3, 0]}>
        <Cylinder ref={leftLegRef} args={[0.12, 0.1, 1.2, 16]} position={[0, -0.5, 0]} castShadow receiveShadow>
          <primitive object={material} attach="material" />
        </Cylinder>
      </group>

      {/* Right Leg */}
      <group position={[0.15, 0.3, 0]}>
        <Cylinder ref={rightLegRef} args={[0.12, 0.1, 1.2, 16]} position={[0, -0.5, 0]} castShadow receiveShadow>
          <primitive object={material} attach="material" />
        </Cylinder>
      </group>
    </group>
  );
});
