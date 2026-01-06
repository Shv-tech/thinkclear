// Cognitive Load Index (CLI) - THINKCLEAR v3
// Measures structural complexity of thinking, NOT emotion
// Implementation EXACTLY as specified

import { CLI } from '../constants';

export type CLILevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CLIResult {
    score: number;
    level: CLILevel;
    metrics: {
        charCount: number;
        wordCount: number;
        sentenceCount: number;
        lineCount: number;
        punctuationCount: number;
        avgSentenceLength: number;
        punctuationRatio: number;
        lineBreakRatio: number;
    };
}

/**
 * Calculate Cognitive Load Index from text
 * Uses ONLY structural signals - no sentiment or emotional keywords
 */
export function calculateCLI(text: string): CLIResult {
    const chars = text.length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const sentences = text.split(/[.!?]/).filter(Boolean).length;
    const lines = text.split('\n').length;
    const punctuation = (text.match(/[!?.,:;]/g) || []).length;

    const avgSentenceLength = words / Math.max(sentences, 1);
    const punctuationRatio = punctuation / Math.max(words, 1);
    const lineBreakRatio = lines / Math.max(sentences, 1);

    let score = 0;
    if (words > 150) score += 1;
    if (words > 300) score += 1;
    if (avgSentenceLength < 8) score += 1;
    if (avgSentenceLength < 5) score += 1;
    if (punctuationRatio > 0.12) score += 1;
    if (lineBreakRatio > 1.5) score += 1;

    const level = classifyCLI(score);

    return {
        score,
        level,
        metrics: {
            charCount: chars,
            wordCount: words,
            sentenceCount: sentences,
            lineCount: lines,
            punctuationCount: punctuation,
            avgSentenceLength,
            punctuationRatio,
            lineBreakRatio,
        },
    };
}

function classifyCLI(score: number): CLILevel {
    if (score <= CLI.LOW_MAX) return 'LOW';
    if (score <= CLI.MEDIUM_MAX) return 'MEDIUM';
    return 'HIGH';
}

/**
 * Get animation duration multiplier based on CLI level
 * Higher cognitive load = slower, calmer animations
 */
export function getCLIDurationMultiplier(level: CLILevel): number {
    switch (level) {
        case 'LOW':
            return 1;
        case 'MEDIUM':
            return 1.25;
        case 'HIGH':
            return 1.5;
    }
}
