import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink } from '@/lib/auth';
import { SESSION } from '@/lib/constants';

// GET /api/auth/verify?token=xxx
// Verify magic link and create session

export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(new URL('/?error=invalid_link', request.url));
        }

        const result = await verifyMagicLink(token);

        if (!result.success || !result.session) {
            return NextResponse.redirect(
                new URL(`/?error=${encodeURIComponent(result.error || 'verification_failed')}`, request.url)
            );
        }

        // Create response with redirect to home
        const response = NextResponse.redirect(new URL('/', request.url));

        // Set session cookie
        response.cookies.set({
            name: SESSION.COOKIE_NAME,
            value: result.session.id,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: SESSION.MAX_AGE_SECONDS,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Verify API error:', error);
        return NextResponse.redirect(new URL('/?error=server_error', request.url));
    }
}
