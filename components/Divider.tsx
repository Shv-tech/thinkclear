'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ANIMATION } from '@/lib/constants';

interface DividerProps {
    className?: string;
    animateOnScroll?: boolean;
}

// Animated horizontal divider with scaleX draw animation
// Triggers on scroll reveal using IntersectionObserver

export default function Divider({
    className = '',
    animateOnScroll = true,
}: DividerProps) {
    const ref = useRef<HTMLHRElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-10%' });
    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
        // Check reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
            setShouldAnimate(false);
        } else {
            setShouldAnimate(animateOnScroll && isInView);
        }
    }, [animateOnScroll, isInView]);

    return (
        <motion.hr
            ref={ref}
            initial={animateOnScroll ? { scaleX: 0 } : { scaleX: 1 }}
            animate={{ scaleX: shouldAnimate || !animateOnScroll ? 1 : 0 }}
            transition={{
                duration: ANIMATION.DIVIDER_DRAW / 1000,
                ease: [0.16, 1, 0.3, 1],
            }}
            className={className}
            style={{
                border: 'none',
                height: '1px',
                background: 'var(--color-border-strong)',
                margin: 'var(--space-xl) 0',
                transformOrigin: 'left center',
            }}
            aria-hidden="true"
        />
    );
}
