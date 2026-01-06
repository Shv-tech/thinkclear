import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';
import { SESSION } from '@/lib/constants';

// POST /api/auth/logout
// Clear session

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get(SESSION.COOKIE_NAME)?.value;

        if (token) {
            await deleteSession(token);
        }

        const response = NextResponse.json({ success: true });

        // Clear cookie
        response.cookies.set({
            name: SESSION.COOKIE_NAME,
            value: '',
            expires: new Date(0),
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Logout API error:', error);
        return NextResponse.json({ success: true }); // Still clear cookie even on error
    }
}
