import { NextRequest, NextResponse } from 'next/server';
import { checkSubscriptionStatus } from '@/lib/payments';
import { getSession } from '@/lib/auth';
import { SESSION } from '@/lib/constants';

// GET /api/payments/status
// Get current subscription status

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get(SESSION.COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.json({
                isSubscribed: false,
                status: 'unauthenticated',
            });
        }

        const session = await getSession(token);

        if (!session.success || !session.session) {
            return NextResponse.json({
                isSubscribed: false,
                status: 'unauthenticated',
            });
        }

        const result = await checkSubscriptionStatus(session.session.userId);

        return NextResponse.json({
            isSubscribed: result.isActive,
            status: result.status,
        });
    } catch (error) {
        console.error('Payment status API error:', error);
        return NextResponse.json({
            isSubscribed: false,
            status: 'error',
        });
    }
}
