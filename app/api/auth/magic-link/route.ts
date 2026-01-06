import { NextRequest, NextResponse } from 'next/server';
import { createMagicLink } from '@/lib/auth';

// POST /api/auth/magic-link
// Send magic link to email

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const result = await createMagicLink(email.toLowerCase().trim());

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to create magic link' },
                { status: 500 }
            );
        }

        // In production, send email with the token
        // For now, we'll construct the magic link URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const magicLinkUrl = `${baseUrl}/api/auth/verify?token=${result.token}`;

        // TODO: Send email using configured provider
        // For development, log the link
        if (process.env.NODE_ENV === 'development') {
            console.log('Magic link URL:', magicLinkUrl);
        }

        // Don't expose token in response for security
        return NextResponse.json({
            success: true,
            message: 'Magic link sent to your email',
        });
    } catch (error) {
        console.error('Magic link API error:', error);
        return NextResponse.json(
            { error: 'Failed to send magic link' },
            { status: 500 }
        );
    }
}
