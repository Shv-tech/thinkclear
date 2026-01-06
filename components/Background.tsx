'use client';

import { useEffect, useRef } from 'react';
import { CLIResult } from '@/lib/cognitive';

interface BackgroundProps {
    cli?: CLIResult | null;
}

// "Ink/Fog" Ambient Background
// Principles:
// - Non-representational (no dots, lines, or networks)
// - Slow, fluid motion (perlin/simplex noise influence)
// - Low contrast/opacity
// - Cognitive load interaction: High Load = Slower/Cleaner

export default function Background({ cli }: BackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const speedRef = useRef(1);
    const particlesRef = useRef<any[]>([]);

    // Determine target speed based on cognitive load
    // Low load = standard slow drift (1x)
    // High load = nearly still (0.2x)
    const targetSpeed = cli?.level === 'HIGH' ? 0.2 : cli?.level === 'MEDIUM' ? 0.5 : 1;

    // Separate effect to update speed ref without triggering re-renders
    useEffect(() => {
        speedRef.current = targetSpeed; // Set target, let loop interpolate
    }, [targetSpeed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Configuration
        const PARTICLE_COUNT = 6;
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let currentSpeed = 1; // Internal interpolated speed

        class Blob {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            baseRadius: number;
            color: string;
            angle: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.angle = Math.random() * Math.PI * 2;
                this.baseRadius = Math.min(width, height) * (0.3 + Math.random() * 0.3);
                this.radius = this.baseRadius;

                // Very subtle colors: mostly dark, some slightly creamy/brownish
                // Opacity is key: extremely low (0.01 - 0.04) allows stacking
                const hue = 35 + Math.random() * 10; // ~40deg is warm (cream/gold)
                const sat = 20 + Math.random() * 10; // Low saturation
                const light = 10 + Math.random() * 5; // Very Dark value
                this.color = `hsla(${hue}, ${sat}%, ${light}%, 0.5)`; // Higher opacity but used with specific blending

                // Random drift velocity
                const v = 0.2 + Math.random() * 0.2;
                this.vx = Math.cos(this.angle) * v;
                this.vy = Math.sin(this.angle) * v;
            }

            update(speed: number) {
                // Move position
                this.x += this.vx * speed;
                this.y += this.vy * speed;

                // Gentle pulsation of size
                const time = Date.now() / 3000;
                this.radius = this.baseRadius + Math.sin(time + this.angle) * 20;

                // Wrap around with buffer
                const buffer = this.radius;
                if (this.x < -buffer) this.x = width + buffer;
                if (this.x > width + buffer) this.x = -buffer;
                if (this.y < -buffer) this.y = height + buffer;
                if (this.y > height + buffer) this.y = -buffer;
            }

            draw() {
                if (!ctx) return;

                // Create gradient
                const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                g.addColorStop(0, `rgba(40, 36, 30, 0.04)`); // Center: subtle warm dark
                g.addColorStop(0.5, `rgba(30, 30, 30, 0.02)`);
                g.addColorStop(1, `rgba(26, 26, 26, 0)`); // Fade to background color

                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize particles only once or on resize
        const initParticles = () => {
            particlesRef.current = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particlesRef.current.push(new Blob());
            }
        };

        initParticles();

        let animationId: number;
        const render = () => {
            // Interpolate currentSpeed towards target (speedRef)
            const diff = speedRef.current - currentSpeed;
            if (Math.abs(diff) > 0.001) {
                currentSpeed += diff * 0.02; // Smooth transition
            } else {
                currentSpeed = speedRef.current;
            }

            // Clear screen
            ctx.clearRect(0, 0, width, height);

            // Draw all particles
            // Composite operation: 'screen' or 'lighter' creates nice overlaps
            // 'source-over' is standard painter's algorithm
            ctx.globalCompositeOperation = 'source-over';

            particlesRef.current.forEach(p => {
                p.update(currentSpeed);
                p.draw();
            });

            animationId = requestAnimationFrame(render);
        };

        render();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []); // Run once

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: -1,
                // The blur is crucial for the "ink in water" look
                filter: 'blur(60px)',
                opacity: 0.8,
            }}
        />
    );
}
