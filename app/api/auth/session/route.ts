import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserById } from '@/lib/auth';
import { SESSION } from '@/lib/constants';

// GET /api/auth/session
// Get current session state

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get(SESSION.COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.json({
                authenticated: false,
                user: null,
            });
        }

        const result = await getSession(token);

        if (!result.success || !result.session) {
            return NextResponse.json({
                authenticated: false,
                user: null,
            });
        }

        // Get user details
        const user = await getUserById(result.session.userId);

        if (!user) {
            return NextResponse.json({
                authenticated: false,
                user: null,
            });
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                subscriptionStatus: user.subscriptionStatus,
            },
        });
    } catch (error) {
        console.error('Session API error:', error);
        return NextResponse.json({
            authenticated: false,
            user: null,
            error: 'Failed to get session',
        });
    }
}
