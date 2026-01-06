// LLM Integration Layer - THINKCLEAR v3
// Provider-agnostic interface for cognitive processing
// Dynamic rule-based fallback that analyzes actual input

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
 * Process thought through LLM
 */
export async function processWithLLM(context: PipelineContext): Promise<LLMProcessedResult> {
    const density = getOutputDensity(context.cli);

    const provider = process.env.LLM_PROVIDER;

    if (provider === 'openai') {
        return processWithOpenAI(context, density);
    } else if (provider === 'anthropic') {
        return processWithAnthropic(context, density);
    } else {
        // Use intelligent rule-based processing
        return processWithRules(context, density);
    }
}

async function processWithOpenAI(
    context: PipelineContext,
    density: 'detailed' | 'standard' | 'minimal'
): Promise<LLMProcessedResult> {
    console.log('OpenAI provider configured but not implemented - using rules');
    return processWithRules(context, density);
}

async function processWithAnthropic(
    context: PipelineContext,
    density: 'detailed' | 'standard' | 'minimal'
): Promise<LLMProcessedResult> {
    console.log('Anthropic provider configured but not implemented - using rules');
    return processWithRules(context, density);
}

/**
 * Intelligent rule-based processing that actually analyzes the input
 */
function processWithRules(
    context: PipelineContext,
    density: 'detailed' | 'standard' | 'minimal'
): LLMProcessedResult {
    const text = context.normalizedText;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);

    const itemCount = density === 'minimal' ? 2 : density === 'standard' ? 3 : 4;

    // Extract key themes and phrases from the input
    const themes = extractThemes(text);
    const concerns = extractConcerns(sentences);
    const actions = extractActionPhrases(sentences);

    // Generate contextual output based on actual content
    const issues = generateCoreIssues(themes, concerns, sentences, itemCount);
    const controllables = generateControllables(actions, themes, itemCount);
    const letGo = generateLetGo(themes, concerns, itemCount - 1);
    const steps = generateNextSteps(issues, controllables, themes, itemCount);

    return {
        coreIssues: issues,
        canControl: controllables,
        letGo: letGo,
        nextSteps: steps,
    };
}

// Theme extraction with keyword analysis
function extractThemes(text: string): string[] {
    const themes: string[] = [];
    const lowerText = text.toLowerCase();

    const themePatterns: [RegExp, string][] = [
        [/\b(work|job|career|office|boss|manager|colleague|deadline|project)\b/i, 'work'],
        [/\b(relationship|partner|spouse|boyfriend|girlfriend|dating|marriage|love)\b/i, 'relationships'],
        [/\b(money|financial|debt|bills|salary|income|budget|savings)\b/i, 'finances'],
        [/\b(family|parent|mother|father|sibling|children|kids)\b/i, 'family'],
        [/\b(health|sick|doctor|medical|anxiety|stress|depression|tired|sleep)\b/i, 'health'],
        [/\b(decision|choice|choose|option|should i|wondering if)\b/i, 'decisions'],
        [/\b(future|plan|goal|dream|aspiration|ambition)\b/i, 'future'],
        [/\b(time|busy|schedule|overwhelm|too much)\b/i, 'time management'],
        [/\b(friend|friendship|social|lonel|isolat)\b/i, 'social'],
        [/\b(creative|project|idea|start|begin|launch)\b/i, 'creative projects'],
    ];

    for (const [pattern, theme] of themePatterns) {
        if (pattern.test(lowerText) && !themes.includes(theme)) {
            themes.push(theme);
        }
    }

    return themes.length > 0 ? themes : ['personal growth'];
}

// Extract specific concerns from sentences
function extractConcerns(sentences: string[]): string[] {
    const concerns: string[] = [];

    const concernPatterns = [
        /(?:i(?:'m| am))\s+(?:worried|concerned|anxious|scared|afraid|unsure|confused|stuck|overwhelmed)\s+(?:about|that|because)?\s*(.+)/i,
        /(?:i\s+(?:don't|can't|cannot|couldn't))\s+(?:know|understand|decide|figure out|see)\s*(.+)/i,
        /(?:i\s+(?:feel|felt))\s+(?:like|that|as if)?\s*(.+)/i,
        /(?:what\s+(?:if|should))\s*(.+)/i,
        /(?:i\s+(?:keep|always|never|constantly))\s+(.+)/i,
    ];

    for (const sentence of sentences) {
        for (const pattern of concernPatterns) {
            const match = sentence.match(pattern);
            if (match && match[1]) {
                const concern = match[1].trim().slice(0, 60);
                if (concern.length > 5) {
                    concerns.push(concern);
                }
            }
        }
    }

    return concerns;
}

// Extract action-related phrases
function extractActionPhrases(sentences: string[]): string[] {
    const actions: string[] = [];

    const actionPatterns = [
        /(?:i\s+(?:should|could|might|need to|want to|have to|must))\s+(.+)/i,
        /(?:maybe\s+i\s+(?:should|could|can))\s+(.+)/i,
        /(?:i\s+(?:was thinking|thought about|considered))\s+(.+)/i,
    ];

    for (const sentence of sentences) {
        for (const pattern of actionPatterns) {
            const match = sentence.match(pattern);
            if (match && match[1]) {
                const action = match[1].trim().slice(0, 50);
                if (action.length > 5) {
                    actions.push(action);
                }
            }
        }
    }

    return actions;
}

// Generate contextual core issues
function generateCoreIssues(
    themes: string[],
    concerns: string[],
    sentences: string[],
    count: number
): string[] {
    const issues: string[] = [];

    // Use extracted concerns first
    for (const concern of concerns.slice(0, count)) {
        issues.push(capitalizeFirst(cleanPhrase(concern)));
    }

    // Fall back to analyzing sentences for themes
    if (issues.length < count) {
        for (const sentence of sentences) {
            if (issues.length >= count) break;

            const trimmed = sentence.trim();
            if (trimmed.length < 10) continue;

            // Look for negative patterns
            if (/\b(not|can't|don't|won't|never|problem|issue|struggle|difficult|hard)\b/i.test(trimmed)) {
                const issue = extractKeyPhrase(trimmed);
                if (issue && !issues.some(i => i.toLowerCase().includes(issue.toLowerCase().slice(0, 20)))) {
                    issues.push(capitalizeFirst(issue));
                }
            }
        }
    }

    // Add theme-based issues if still need more
    const themeIssues: Record<string, string[]> = {
        'work': ['Balancing workload with available capacity', 'Navigating workplace expectations', 'Setting professional boundaries'],
        'relationships': ['Communicating needs clearly', 'Balancing personal space with connection', 'Addressing unresolved tensions'],
        'finances': ['Managing financial uncertainty', 'Prioritizing spending decisions', 'Building financial security'],
        'family': ['Navigating family dynamics', 'Setting healthy boundaries', 'Balancing obligations and self-care'],
        'health': ['Managing energy levels', 'Addressing underlying stress', 'Prioritizing wellbeing'],
        'decisions': ['Weighing options with incomplete information', 'Fear of making the wrong choice', 'Analysis paralysis'],
        'future': ['Uncertainty about next steps', 'Aligning actions with long-term goals', 'Impatience with progress'],
        'time management': ['Too many competing priorities', 'Difficulty saying no', 'Feeling behind on everything'],
        'social': ['Maintaining meaningful connections', 'Finding belonging', 'Balancing solitude and community'],
        'creative projects': ['Getting started despite uncertainty', 'Overcoming perfectionism', 'Finding time for creation'],
        'personal growth': ['Identifying what truly matters', 'Moving forward despite confusion', 'Processing complex thoughts'],
    };

    for (const theme of themes) {
        if (issues.length >= count) break;
        const themeItems = themeIssues[theme] || themeIssues['personal growth'];
        for (const item of themeItems) {
            if (issues.length >= count) break;
            if (!issues.includes(item)) {
                issues.push(item);
            }
        }
    }

    return issues.slice(0, count);
}

// Generate contextual controllables
function generateControllables(
    actions: string[],
    themes: string[],
    count: number
): string[] {
    const controllables: string[] = [];

    // Use extracted actions
    for (const action of actions.slice(0, count)) {
        controllables.push(capitalizeFirst(cleanPhrase(action)));
    }

    // Theme-based controllables
    const themeControllables: Record<string, string[]> = {
        'work': ['How you prioritize your tasks each day', 'When and how you communicate with your manager', 'The boundaries you set around work hours', 'Your response to added requests'],
        'relationships': ['How you express your needs', 'The energy you invest in the relationship', 'How you respond to conflict', 'The time you dedicate to connection'],
        'finances': ['Your daily spending choices', 'Where you seek financial guidance', 'How you track your money', 'The financial conversations you initiate'],
        'family': ['How you respond to family requests', 'The boundaries you communicate', 'The time you allocate to family', 'Your emotional reactions'],
        'health': ['Your daily habits and routines', 'When you rest vs push through', 'Who you ask for support', 'How you talk to yourself'],
        'decisions': ['What information you gather', 'Who you consult', 'The deadline you set for deciding', 'Whether you accept imperfection'],
        'future': ['The first small step you take', 'How you define success', 'Who you share your plans with', 'What you learn each day'],
        'time management': ['What you say yes and no to', 'How you structure your morning', 'Which tasks you tackle first', 'When you take breaks'],
        'social': ['Who you reach out to', 'How you show up in conversations', 'The invitations you accept', 'How you nurture existing friendships'],
        'creative projects': ['When you show up to create', 'What you let yourself try', 'How you define done', 'Whose feedback you seek'],
        'personal growth': ['The questions you sit with', 'How you process your thoughts', 'What you choose to focus on today', 'How you talk to yourself'],
    };

    for (const theme of themes) {
        if (controllables.length >= count) break;
        const items = themeControllables[theme] || themeControllables['personal growth'];
        for (const item of items) {
            if (controllables.length >= count) break;
            if (!controllables.includes(item)) {
                controllables.push(item);
            }
        }
    }

    return controllables.slice(0, count);
}

// Generate contextual let-go items
function generateLetGo(
    themes: string[],
    concerns: string[],
    count: number
): string[] {
    const letGo: string[] = [];

    const themeLetGo: Record<string, string[]> = {
        'work': ["Others' reactions to your boundaries", 'Past mistakes at work', 'Making everyone happy'],
        'relationships': ["How the other person responds", 'Changing someone who doesn\'t want to change', 'Perfect timing'],
        'finances': ['Past financial decisions', 'Economic factors beyond your control', 'Keeping up with others'],
        'family': ["Family members' choices", 'Old family patterns overnight', 'Being understood by everyone'],
        'health': ['Perfect health all the time', 'Comparing to your past self', 'Instant recovery'],
        'decisions': ['Knowing the outcome beforehand', 'Making a perfect choice', "Others' opinions of your decision"],
        'future': ['Controlling timelines', 'Certainty about outcomes', 'Having it all figured out'],
        'time management': ['Doing everything', 'Others expecting immediate responses', 'Productivity as identity'],
        'social': ["Others' perceptions of you", 'Being liked by everyone', 'Forcing connections'],
        'creative projects': ['Perfection in creative work', 'External validation', 'Comparing to others'],
        'personal growth': ['Having all the answers right now', 'Fixing everything at once', 'Linear progress'],
    };

    for (const theme of themes) {
        if (letGo.length >= count) break;
        const items = themeLetGo[theme] || themeLetGo['personal growth'];
        for (const item of items) {
            if (letGo.length >= count) break;
            if (!letGo.includes(item)) {
                letGo.push(item);
            }
        }
    }

    return letGo.slice(0, Math.max(1, count));
}

// Generate contextual next steps
function generateNextSteps(
    issues: string[],
    controllables: string[],
    themes: string[],
    count: number
): string[] {
    const steps: string[] = [];

    // Generate steps based on the specific issues identified
    if (issues.length > 0) {
        const firstIssue = issues[0].toLowerCase();
        steps.push(`Write down specifically what's bothering you most about: "${issues[0].slice(0, 30)}..."`);
    }

    if (controllables.length > 0) {
        steps.push(`Spend 10 minutes on just one thing you control: ${controllables[0].toLowerCase()}`);
    }

    // Theme-specific actionable steps
    const themeSteps: Record<string, string[]> = {
        'work': ['Block 30 minutes to list and prioritize your top 3 tasks', 'Draft a message setting one clear boundary', 'Schedule a conversation with your manager about capacity'],
        'relationships': ['Write down exactly what you need (without how the other person should change)', 'Plan one moment of undivided attention this week', 'Express one appreciation you have been holding back'],
        'finances': ['List all financial obligations for the next 30 days', 'Identify one expense you can reduce this week', 'Set up auto-save for even a tiny amount'],
        'family': ['Choose one boundary to communicate this week', 'Plan quality time with the family member who matters most', 'Write out what you wish they understood (just for yourself)'],
        'health': ['Commit to one non-negotiable rest period today', 'Write down what good enough looks like for your health this week', 'Tell one person how you are really doing'],
        'decisions': ['List the top 3 options you are considering', 'Give yourself a decision deadline', 'Identify the one value that matters most in this choice'],
        'future': ['Define what progress looks like this week (not this year)', 'Identify the smallest possible next action', 'Write your future self a note about what you are attempting'],
        'time management': ['List everything demanding your attention right now', 'Choose 3 things to focus on and consciously release the rest', 'Identify one commitment to renegotiate or decline'],
        'social': ['Send one message to someone you have been meaning to contact', 'Schedule one social activity, even if brief', 'Reflect on what you are seeking from connection'],
        'creative projects': ['Set a timer for 15 minutes and create without judgment', 'Identify the smallest possible version of your project', 'Share your idea with one trusted person'],
        'personal growth': ['Write freely for 10 minutes about what you are processing', 'Identify the question at the heart of your confusion', 'Choose one tiny action that feels aligned'],
    };

    for (const theme of themes) {
        if (steps.length >= count) break;
        const items = themeSteps[theme] || themeSteps['personal growth'];
        for (const item of items) {
            if (steps.length >= count) break;
            if (!steps.some(s => s.toLowerCase().includes(item.toLowerCase().slice(0, 30)))) {
                steps.push(item);
            }
        }
    }

    return steps.slice(0, count);
}

// Helper functions
function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function cleanPhrase(phrase: string): string {
    return phrase
        .replace(/^(i\s+)/i, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 70);
}

function extractKeyPhrase(sentence: string): string | null {
    // Remove common filler words and extract key phrase
    const cleaned = sentence
        .replace(/\b(i|me|my|myself|we|us|our|the|a|an|that|this|it|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|must|shall|just|really|very|so|too|also|even|only|now|then|here|there|when|where|why|how|what|which|who|whom|whose)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (cleaned.length > 10) {
        return cleaned.slice(0, 60);
    }
    return null;
}
