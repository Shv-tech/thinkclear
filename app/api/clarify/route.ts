import { NextRequest, NextResponse } from 'next/server';
import { processCognition } from '@/lib/cognitive';

// POST /api/clarify
// Main cognition endpoint - processes thought input

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        if (text.length > 10000) {
            return NextResponse.json(
                { error: 'Text too long (max 10,000 characters)' },
                { status: 400 }
            );
        }

        // Process through cognitive pipeline
        const result = await processCognition({ text });

        // Return structured output
        // Note: CLI is included but not labeled to user
        return NextResponse.json({
            coreIssues: result.coreIssues,
            canControl: result.canControl,
            letGo: result.letGo,
            nextSteps: result.nextSteps,
            // CLI included for client-side animation timing only
            cli: {
                level: result.cli.level,
                // Don't expose score or metrics to client
            },
        });
    } catch (error) {
        console.error('Clarify API error:', error);
        return NextResponse.json(
            { error: 'Failed to process thoughts' },
            { status: 500 }
        );
    }
}

// Reject other methods
export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}
