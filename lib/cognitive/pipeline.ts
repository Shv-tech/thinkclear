// lib/cognitive/pipeline.ts
import { calculateCLI, CLIResult } from './cli';
import { processWithLLM } from '../llm';
import { CognitiveInput, CognitiveOutput, PipelineContext } from './types';
export * from './types';

/**
 * Main cognitive processing pipeline - Updated to handle Pro status
 */
export async function processCognition(input: CognitiveInput, isPro: boolean = false): Promise<CognitiveOutput> {
    const normalizedText = normalize(input.text);
    const cli = calculateCLI(normalizedText);

    const context: PipelineContext = {
        originalText: input.text,
        normalizedText,
        cli,
    };

    // Pass isPro to the LLM layer
    const result = await processWithLLM(context, isPro);

    return {
        ...result,
        cli,
    };
}

function normalize(text: string): string {
    return text.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

export function getOutputDensity(cli: CLIResult): 'detailed' | 'standard' | 'minimal' {
    switch (cli.level) {
        case 'LOW': return 'detailed';
        case 'MEDIUM': return 'standard';
        case 'HIGH': return 'minimal';
    }
}