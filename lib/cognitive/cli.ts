// lib/cognitive/cli.ts
import { CLI } from '../constants';

export type CLILevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CLIResult {
    score: number;
    level: CLILevel;
    clarityScore: number; 
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

export function calculateCLI(text: string): CLIResult {
    const chars = text.length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const sentences = text.split(/[.!?]/).filter(Boolean).length;
    const lines = text.split('\n').length;
    const punctuation = (text.match(/[!?.,:;]/g) || []).length;

    const avgSentenceLength = words / Math.max(sentences, 1);
    const punctuationRatio = punctuation / Math.max(words, 1);
    const lineBreakRatio = lines / Math.max(sentences, 1);

    let loadScore = 0;
    if (words > 150) loadScore += 1;
    if (words > 300) loadScore += 1;
    if (avgSentenceLength < 8) loadScore += 1; // Short, choppy thinking
    if (avgSentenceLength > 25) loadScore += 1; // Long, rambling thinking
    if (punctuationRatio > 0.12) loadScore += 1;
    if (lineBreakRatio > 1.5) loadScore += 1;

    // Logic: 100 is pure clarity. Higher load reduces score.
    const baseClarity = 100 - (loadScore * 12);
    const depthBonus = words > 50 ? 10 : 0; 
    const clarityScore = Math.min(100, Math.max(0, baseClarity + depthBonus));

    return {
        score: loadScore,
        level: loadScore <= CLI.LOW_MAX ? 'LOW' : loadScore <= CLI.MEDIUM_MAX ? 'MEDIUM' : 'HIGH',
        clarityScore,
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
export function getCLIDurationMultiplier(level: CLILevel): number {
    switch (level) {
        case 'LOW': return 1.0; 
        case 'MEDIUM': return 1.2;
        case 'HIGH': return 1.5;
    }
}