import { CLIResult } from './cli';

export interface CognitiveInput {
    text: string;
}

export interface CognitiveOutput {
    coreIssues: string[];
    canControl: string[];
    letGo: string[];
    nextSteps: string[];
    cli: CLIResult;
}

export interface PipelineContext {
    originalText: string;
    normalizedText: string;
    cli: CLIResult;
}
