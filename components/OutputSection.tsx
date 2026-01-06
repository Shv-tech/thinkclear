'use client';

import { motion } from 'framer-motion';
import { OUTPUT_SECTIONS, ANIMATION } from '@/lib/constants';
import { CognitiveOutput } from '@/lib/cognitive';
import Divider from './Divider';

interface OutputSectionProps {
    output: CognitiveOutput;
    animationMultiplier?: number;
}

// Structured output display with exactly 4 sections
// Staggered reveal animations

export default function OutputSection({
    output,
    animationMultiplier = 1,
}: OutputSectionProps) {
    const baseDuration = ANIMATION.ENTRY_FADE / 1000 * animationMultiplier;
    const staggerDelay = ANIMATION.SECTION_STAGGER / 1000 * animationMultiplier;

    const sections = [
        { title: OUTPUT_SECTIONS.CORE_ISSUES, items: output.coreIssues },
        { title: OUTPUT_SECTIONS.CAN_CONTROL, items: output.canControl },
        { title: OUTPUT_SECTIONS.LET_GO, items: output.letGo },
        { title: OUTPUT_SECTIONS.NEXT_STEPS, items: output.nextSteps },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: baseDuration }}
            style={{ marginTop: 'var(--space-2xl)' }}
        >
            <Divider />

            {sections.map((section, sectionIndex) => (
                <motion.section
                    key={section.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: baseDuration,
                        delay: staggerDelay * (sectionIndex + 1),
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                        marginTop: sectionIndex === 0 ? 'var(--space-xl)' : 'var(--space-2xl)',
                    }}
                >
                    <h3 className="section-title">{section.title}</h3>

                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                        }}
                    >
                        {section.items.map((item, itemIndex) => (
                            <motion.li
                                key={itemIndex}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: baseDuration * 0.8,
                                    delay: staggerDelay * (sectionIndex + 1) + (itemIndex * 0.1),
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                style={{
                                    padding: 'var(--space-sm) 0',
                                    borderBottom: itemIndex < section.items.length - 1
                                        ? '1px solid var(--color-border)'
                                        : 'none',
                                    fontSize: 'var(--text-base)',
                                    lineHeight: 'var(--leading-relaxed)',
                                }}
                            >
                                {item}
                            </motion.li>
                        ))}
                    </ul>
                </motion.section>
            ))}

            {/* Reset prompt */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: baseDuration,
                    delay: staggerDelay * 6,
                }}
                style={{
                    marginTop: 'var(--space-3xl)',
                    textAlign: 'center',
                }}
            >
                <p className="text-subtle" style={{ fontSize: 'var(--text-sm)' }}>
                    This output is not saved. Refresh to start fresh.
                </p>
            </motion.div>
        </motion.div>
    );
}
