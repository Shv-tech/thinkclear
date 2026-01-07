'use client';

import { useEffect, useRef } from 'react';

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    let t = 0;

    const loop = () => {
      t += 0.002;

      ctx.fillStyle = 'rgba(10,10,10,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      const g = ctx.createRadialGradient(
        w * 0.5 + Math.sin(t) * 120,
        h * 0.5 + Math.cos(t) * 90,
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.5
      );

      g.addColorStop(0, 'rgba(175, 21, 57, 0.74)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0.43)');
      g.addColorStop(0.5, 'rgba(128, 5, 13, 0.58)');
      

      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      requestAnimationFrame(loop);
    };

    loop();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at center, rgba(54, 0, 4, 0.82) 0%, rgba(89, 1, 26, 1) 50%, rgba(131, 1, 49, 0.86) 80%), rgba(153, 16, 68, 1) 45%, rgba(54, 0, 4, 0.82) 15%',
        }}
      />
    </>
  );
}
