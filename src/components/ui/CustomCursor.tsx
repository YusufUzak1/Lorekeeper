import { useEffect, useState } from 'react';

export function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [ringPos, setRingPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      setMousePos({ x: mx, y: my });
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'mousemove') {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          const rect = iframe.getBoundingClientRect();
          mx = e.data.clientX + rect.left;
          my = e.data.clientY + rect.top;
          setMousePos({ x: mx, y: my });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('message', handleMessage);

    const animate = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      setRingPos({ x: rx, y: ry });
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('message', handleMessage);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div
        className="fixed pointer-events-none z-[99999] rounded-full bg-mythos-accent mix-blend-screen shadow-[0_0_14px_rgba(212,175,55,0.7)]"
        style={{
          width: '8px',
          height: '8px',
          left: mousePos.x,
          top: mousePos.y,
          transform: 'translate(-50%, -50%)',
          willChange: 'left, top',
        }}
      />
      <div
        className="fixed pointer-events-none z-[99998] rounded-full border border-mythos-accent/30"
        style={{
          width: '28px',
          height: '28px',
          left: ringPos.x,
          top: ringPos.y,
          transform: 'translate(-50%, -50%)',
          willChange: 'left, top',
        }}
      />
    </>
  );
}
