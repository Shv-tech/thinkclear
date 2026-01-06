import { calculateCLI, CLIResult } from './cli';
import { processWithLLM, CognitivePrompt } from '../llm';
import { CognitiveInput, CognitiveOutput, PipelineContext } from './types';
export * from './types';

/**
 * Main cognitive processing pipeline
 * Server-side only - processes thought input into structured clarity
 */
export async function processCognition(input: CognitiveInput): Promise<CognitiveOutput> {
    // Stage 1: Normalize input
    const normalizedText = normalize(input.text);

    // Stage 2: Calculate Cognitive Load Index
    const cli = calculateCLI(normalizedText);

    // Build context for remaining stages
    const context: PipelineContext = {
        originalText: input.text,
        normalizedText,
        cli,
    };

    // Stage 3-5: LLM-powered processing
    // distillCore -> mapControl -> synthesize
    const result = await processWithLLM(context);

    return {
        ...result,
        cli,
    };
}

/**
 * Stage 1: Normalize input
 * Clean and prepare text for processing
 */
function normalize(text: string): string {
    return text
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        // Normalize line breaks
        .replace(/\n{3,}/g, '\n\n')
        // Trim
        .trim();
}

/**
 * Get output density based on CLI level
 * Higher load = simpler, shorter output
 */
export function getOutputDensity(cli: CLIResult): 'detailed' | 'standard' | 'minimal' {
    switch (cli.level) {
        case 'LOW':
            return 'detailed';
        case 'MEDIUM':
            return 'standard';
        case 'HIGH':
            return 'minimal';
    }
}
