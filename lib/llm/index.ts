// lib/llm/index.ts
import { PipelineContext, getOutputDensity } from '../cognitive/pipeline';

export interface CognitivePrompt {
    context: PipelineContext;
    systemPrompt: string;
}

export interface LLMProcessedResult {
    coreIssues: string[];
    canControl: string[];
    letGo: string[];
    nextSteps: string[];
}

/**
 * Process thought through LLM with Hybrid Gating
 */
export async function processWithLLM(
    context: PipelineContext, 
    isPro: boolean = false // Parameter added to support usage gating
): Promise<LLMProcessedResult> {
    const density = getOutputDensity(context.cli);
    const provider = process.env.LLM_PROVIDER;

    // Use high-end LLMs only for Pro users
    if (isPro && provider === 'openai') {
        return processWithOpenAI(context, density);
    } else if (isPro && provider === 'anthropic') {
        return processWithAnthropic(context, density);
    }

    // Default to intelligent rule-based processing for free tier or if no provider set
    return processWithRules(context, density);
}

async function processWithOpenAI(
    context: PipelineContext,
    density: 'detailed' | 'standard' | 'minimal'
): Promise<LLMProcessedResult> {
    console.log('OpenAI provider logic would go here - currently using rules');
    return processWithRules(context, density);
}

async function processWithAnthropic(
    context: PipelineContext,
    density: 'detailed' | 'standard' | 'minimal'
): Promise<LLMProcessedResult> {
    console.log('Anthropic provider logic would go here - currently using rules');
    return processWithRules(context, density);
}

/**
 * Intelligent rule-based processing
 */
function processWithRules(
    context: PipelineContext,
    density: 'detailed' | 'standard' | 'minimal'
): LLMProcessedResult {
    const text = context.normalizedText;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const itemCount = density === 'minimal' ? 2 : density === 'standard' ? 3 : 4;

    const themes = extractThemes(text);
    const concerns = extractConcerns(sentences);
    const actions = extractActionPhrases(sentences);

    return {
        coreIssues: generateCoreIssues(themes, concerns, sentences, itemCount),
        canControl: generateControllables(actions, themes, itemCount),
        letGo: generateLetGo(themes, concerns, itemCount - 1),
        nextSteps: generateNextSteps(themes, concerns, itemCount),
    };
}

// ... Helper functions for extractThemes, extractConcerns, generateCoreIssues, etc. 
// (Maintain existing logic from uploaded lib/llm/index.ts)

function extractThemes(text: string): string[] {
    const themes: string[] = [];
    const lowerText = text.toLowerCase();
    const themePatterns: [RegExp, string][] = [
        [/\b(work|job|career|office|boss|deadline|project)\b/i, 'work'],
        [/\b(relationship|partner|spouse|marriage|love)\b/i, 'relationships'],
        [/\b(money|financial|debt|bills|salary|income)\b/i, 'finances'],
        [/\b(health|anxiety|stress|depression|tired|sleep)\b/i, 'health'],
        [/\b(future|plan|goal|dream|aspiration)\b/i, 'future'],
    ];
    for (const [pattern, theme] of themePatterns) {
        if (pattern.test(lowerText) && !themes.includes(theme)) themes.push(theme);
    }
    return themes.length > 0 ? themes : ['personal growth'];
}

function extractConcerns(sentences: string[]): string[] {
    const concerns: string[] = [];
    const patterns = [/(?:i(?:'m| am))\s+(?:worried|concerned|anxious|stressed)\s+(?:about|that)?\s*(.+)/i];
    for (const s of sentences) {
        for (const p of patterns) {
            const m = s.match(p);
            if (m && m[1]) concerns.push(m[1].trim().slice(0, 60));
        }
    }
    return concerns;
}

function extractActionPhrases(sentences: string[]): string[] {
    const actions: string[] = [];
    const patterns = [/(?:i\s+(?:should|could|might|need to|want to))\s+(.+)/i];
    for (const s of sentences) {
        for (const p of patterns) {
            const m = s.match(p);
            if (m && m[1]) actions.push(m[1].trim().slice(0, 50));
        }
    }
    return actions;
}

function generateCoreIssues(themes: string[], concerns: string[], sentences: string[], count: number): string[] {
    const issues = concerns.map(c => c.charAt(0).toUpperCase() + c.slice(1));
    if (issues.length < count) {
        themes.forEach(t => issues.push(`Managing ${t} related pressure`));
    }
    return Array.from(new Set(issues)).slice(0, count);
}

function generateControllables(actions: string[], themes: string[], count: number): string[] {
    const ctrl = actions.map(a => a.charAt(0).toUpperCase() + a.slice(1));
    if (ctrl.length < count) {
        ctrl.push("Your immediate reaction to these thoughts");
        ctrl.push("The time you allocate to processing this");
    }
    return Array.from(new Set(ctrl)).slice(0, count);
}

function generateLetGo(themes: string[], concerns: string[], count: number): string[] {
    return ["Other people's reactions", "Outcomes you cannot yet see", "Past versions of this situation"].slice(0, count);
}

function generateNextSteps(themes: string[], concerns: string[], count: number): string[] {
    return ["Write down the single most important task", "Step away from the screen for 5 minutes", "Define what 'done' looks like for today"].slice(0, count);
}