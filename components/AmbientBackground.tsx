'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

// Enhanced procedural ambient background with visible gradient animation
// Creates a calm, mesmerizing visual effect

export default function AmbientBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const time = Date.now() * 0.0003; // Slightly faster for more visible motion

        // Clear with slight fade for trail effect
        ctx.fillStyle = 'rgba(26, 26, 26, 0.03)';
        ctx.fillRect(0, 0, width, height);

        // Multiple floating orbs with different colors and speeds
        const orbs = [
            {
                x: width * 0.3 + Math.sin(time * 0.7) * 150,
                y: height * 0.4 + Math.cos(time * 0.5) * 100,
                radius: Math.max(width, height) * 0.5,
                color1: 'rgba(212, 197, 169, 0.08)',
                color2: 'rgba(212, 197, 169, 0)',
            },
            {
                x: width * 0.7 + Math.cos(time * 0.6) * 120,
                y: height * 0.6 + Math.sin(time * 0.8) * 80,
                radius: Math.max(width, height) * 0.4,
                color1: 'rgba(180, 160, 130, 0.06)',
                color2: 'rgba(180, 160, 130, 0)',
            },
            {
                x: width * 0.5 + Math.sin(time * 0.4) * 100,
                y: height * 0.3 + Math.cos(time * 0.9) * 60,
                radius: Math.max(width, height) * 0.35,
                color1: 'rgba(220, 200, 160, 0.05)',
                color2: 'rgba(220, 200, 160, 0)',
            },
            {
                x: width * 0.2 + Math.cos(time * 0.5) * 80,
                y: height * 0.8 + Math.sin(time * 0.7) * 50,
                radius: Math.max(width, height) * 0.3,
                color1: 'rgba(200, 180, 150, 0.04)',
                color2: 'rgba(200, 180, 150, 0)',
            },
        ];

        // Draw each orb
        orbs.forEach(orb => {
            const gradient = ctx.createRadialGradient(
                orb.x, orb.y, 0,
                orb.x, orb.y, orb.radius
            );
            gradient.addColorStop(0, orb.color1);
            gradient.addColorStop(0.5, orb.color1.replace(/[\d.]+\)$/, '0.02)'));
            gradient.addColorStop(1, orb.color2);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        });

        // Add subtle pulsing glow at center
        const pulseIntensity = 0.03 + Math.sin(time * 2) * 0.02;
        const centerGlow = ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, Math.min(width, height) * 0.5
        );
        centerGlow.addColorStop(0, `rgba(245, 240, 230, ${pulseIntensity})`);
        centerGlow.addColorStop(1, 'rgba(245, 240, 230, 0)');
        ctx.fillStyle = centerGlow;
        ctx.fillRect(0, 0, width, height);

        if (!reducedMotion) {
            animationRef.current = requestAnimationFrame(animate);
        }
    }, [reducedMotion]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            const ctx = canvas.getContext('2d');
            if (ctx) ctx.scale(dpr, dpr);
        };

        resize();
        window.addEventListener('resize', resize);

        // Start animation
        if (!reducedMotion) {
            animate();
        } else {
            // Draw static version for reduced motion
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const gradient = ctx.createRadialGradient(
                    canvas.width / 2, canvas.height / 2, 0,
                    canvas.width / 2, canvas.height / 2, canvas.width / 2
                );
                gradient.addColorStop(0, 'rgba(212, 197, 169, 0.05)');
                gradient.addColorStop(1, 'rgba(212, 197, 169, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [animate, reducedMotion]);

    return (
        <>
            <canvas
                ref={canvasRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />

            {/* Enhanced CSS noise overlay */}
            <div
                className="noise-overlay"
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    opacity: 0.04,
                    zIndex: 1,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Gradient vignette for depth */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 1,
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
                }}
            />
        </>
    );
}
