/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

export default function StarsBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Star configuration
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      alpha: number;
      twinkleSpeed: number;
      speedY: number;
      color: string;
    }> = [];

    // Increase star count for a richer, more starry background
    const numStars = Math.min(Math.floor((width * height) / 2000), 450);

    const starTypes = [
      'rgba(255, 255, 255, ',   // pure white
      'rgba(147, 197, 253, ',   // O-Class Supergiant Blue
      'rgba(110, 231, 183, ',   // Cosmic green shimmer
      'rgba(253, 186, 116, ',   // K-Class orange
      'rgba(252, 165, 165, ',   // M-Class red dwarf
    ];

    for (let i = 0; i < numStars; i++) {
      const typeRand = Math.random();
      const colorPrefix = 
        typeRand > 0.88 ? starTypes[1] : 
        typeRand > 0.80 ? starTypes[2] : 
        typeRand > 0.70 ? starTypes[3] : 
        typeRand > 0.60 ? starTypes[4] : 
        starTypes[0];

      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 0.4,
        alpha: Math.random(),
        twinkleSpeed: 0.005 + Math.random() * 0.02,
        speedY: (Math.random() * 0.08 + 0.02) * (Math.random() > 0.5 ? 1 : -1),
        color: colorPrefix,
      });
    }

    // Nebula dust centers with higher intensity and vibrant colors
    const nebulas = [
      { x: width * 0.15, y: height * 0.25, r: Math.max(width * 0.5, 500), color: 'rgba(124, 58, 237, 0.22)' }, // deep warm violet
      { x: width * 0.85, y: height * 0.75, r: Math.max(width * 0.6, 600), color: 'rgba(219, 39, 119, 0.20)' }, // radiant hot pink
      { x: width * 0.5, y: height * 0.5, r: Math.max(width * 0.45, 450), color: 'rgba(6, 182, 212, 0.20)' },  // intense glowing cyan
      { x: width * 0.7, y: height * 0.2, r: Math.max(width * 0.4, 400), color: 'rgba(245, 158, 11, 0.12)' }   // golden stellar amber
    ];

    // Shooting stars array
    const shootingStars: Array<{
      x: number;
      y: number;
      length: number;
      speedX: number;
      speedY: number;
      alpha: number;
      life: number;
      maxLife: number;
    }> = [];

    const spawnShootingStar = () => {
      if (Math.random() > 0.975 && shootingStars.length < 4) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.4,
          length: Math.random() * 120 + 60,
          speedX: Math.random() * 15 + 10,
          speedY: Math.random() * 5 + 4,
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 40 + 25
        });
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
      }
    });
    
    resizeObserver.observe(canvas.parentElement || document.body);

    const animate = () => {
      // Much less dark, highly vibrant cosmic space backdrop with deep rich violet / navy purple gradients
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
      bgGrad.addColorStop(0, '#1c103f');   // rich, bright cosmic space purple core
      bgGrad.addColorStop(0.5, '#0e0824'); // vibrant indigo space hue
      bgGrad.addColorStop(1, '#05030f');   // deeper violet outer space edge
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Nebulas
      nebulas.forEach((neb) => {
        const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.r);
        grad.addColorStop(0, neb.color);
        grad.addColorStop(0.5, neb.color.replace('0.22', '0.08').replace('0.20', '0.06').replace('0.12', '0.04'));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(neb.x, neb.y, neb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Spawn and Draw Shooting Stars (flashy meteor effect with vibrant neon trails)
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const p = shootingStars[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life++;

        if (p.life > p.maxLife) {
          shootingStars.splice(i, 1);
          continue;
        }

        // Fade out at end of life
        const opacity = Math.sin((p.life / p.maxLife) * Math.PI) * 0.9;
        
        // Draw the streak
        const grad = ctx.createLinearGradient(p.x, p.y, p.x - p.length, p.y - p.length * 0.4);
        grad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
        grad.addColorStop(0.15, `rgba(167, 139, 250, ${opacity * 0.75})`); // vibrant violet core trail
        grad.addColorStop(0.4, `rgba(34, 211, 238, ${opacity * 0.5})`);  // bright neon cyan trail
        grad.addColorStop(1, 'transparent');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.length, p.y - p.length * 0.4);
        ctx.stroke();

        // Flashy head core star
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Slowly twinkle
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0.2) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        // Slowly drift vertically
        star.y += star.speedY;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        ctx.fillStyle = `${star.color}${Math.max(0, Math.min(1, star.alpha))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra outer glow and diffraction spikes for brighter/flashier stars
        if (star.size > 1.5 && star.alpha > 0.55) {
          ctx.fillStyle = `${star.color}${star.alpha * 0.45})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Diffraction spike star flare lines
          ctx.strokeStyle = `${star.color}${star.alpha * 0.85})`;
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          // Horizontal spike
          ctx.moveTo(star.x - star.size * 4.5, star.y);
          ctx.lineTo(star.x + star.size * 4.5, star.y);
          // Vertical spike
          ctx.moveTo(star.x, star.y - star.size * 4.5);
          ctx.lineTo(star.x, star.y + star.size * 4.5);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      id="space-starfield"
      ref={canvasRef}
      className="absolute inset-0 block pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
