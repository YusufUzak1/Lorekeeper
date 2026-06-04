import { useEffect, useRef } from 'react';

// Daha ince, uzay grisi + rose gold uyumlu tonlar
const COLORS = ['#f2b8a0', '#ffe1d2', '#9ca3af', '#6b7280', '#a5b4fc'];

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  speedX: number;
  life: number;
  maxLife: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
}

export function Particles({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const createParticle = (initialY?: number): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: initialY !== undefined ? initialY : canvas.height + 10,
        size: Math.random() * 0.9 + 0.3, // 0.3 to ~1.2 px (daha ince)
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speedY: -(Math.random() * 0.6 + 0.15),
        speedX: (Math.random() - 0.5) * 0.35,
        life: 0,
        maxLife: Math.random() * 260 + 120,
        opacity: Math.random() * 0.25 + 0.15,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.05 + 0.01
      };
    };

    // Initialize initial particles scattered across the height
    for (let i = 0; i < 35; i++) {
        particles.push(createParticle(Math.random() * canvas.height));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles occasionally to keep the stream going
      if (Math.random() < 0.1 && particles.length < 70) {
        particles.push(createParticle(canvas.height + 10)); // Start below canvas
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.wobble += p.wobbleSpeed;
        const wobbleX = Math.sin(p.wobble) * 0.5;

        p.x += p.speedX + wobbleX;
        p.y += p.speedY;
        
        p.life++;

        // Fade in first 20 frames, then fade out at the end
        let currentOpacity = p.opacity;
        if (p.life < 20) {
          currentOpacity = p.opacity * (p.life / 20);
        } else if (p.life > p.maxLife - 50) {
          currentOpacity = Math.max(0, p.opacity * ((p.maxLife - p.life) / 50));
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentOpacity;
        
        // Daha yumuşak glow
        ctx.shadowBlur = p.size * 2;
        ctx.shadowColor = p.color;
        
        ctx.fill();

        // Reset particle if it dies or goes off screen
        if (p.life >= p.maxLife || p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
          particles[i] = createParticle(canvas.height + 10);
        }
      }

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={`pointer-events-none ${className}`} 
    />
  );
}
