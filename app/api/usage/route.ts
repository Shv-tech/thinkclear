import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { SESSION, USAGE } from '@/lib/constants';

// GET /api/usage
// Get usage statistics for current user

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get(SESSION.COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.json({
                usageCount: 0,
                dailyRemaining: USAGE.FREE_DAILY_LIMIT,
                isAuthenticated: false,
            });
        }

        const session = await getSession(token);

        if (!session.success || !session.session) {
            return NextResponse.json({
                usageCount: 0,
                dailyRemaining: USAGE.FREE_DAILY_LIMIT,
                isAuthenticated: false,
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.session.userId },
            select: {
                usageCount: true,
                subscriptionStatus: true,
                lastUsedAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({
                usageCount: 0,
                dailyRemaining: USAGE.FREE_DAILY_LIMIT,
                isAuthenticated: false,
            });
        }

        // Calculate daily remaining for free tier
        let dailyRemaining: number = USAGE.FREE_DAILY_LIMIT;

        if (user.subscriptionStatus !== 'active') {
            // Count today's usage
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            // For free tier, we'd need to track daily usage separately
            // For now, use a simple check based on lastUsedAt
            if (user.lastUsedAt && user.lastUsedAt >= todayStart) {
                // Rough approximation - in production, track daily usage properly
                dailyRemaining = Math.max(0, USAGE.FREE_DAILY_LIMIT - 1);
            }
        } else {
            // Unlimited for subscribers
            dailyRemaining = -1; // -1 indicates unlimited
        }

        return NextResponse.json({
            usageCount: user.usageCount,
            dailyRemaining,
            isAuthenticated: true,
            subscriptionStatus: user.subscriptionStatus,
        });
    } catch (error) {
        console.error('Usage API error:', error);
        return NextResponse.json({
            usageCount: 0,
            dailyRemaining: USAGE.FREE_DAILY_LIMIT,
            isAuthenticated: false,
            error: 'Failed to get usage',
        });
    }
}

// POST /api/usage
// Increment usage counter

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get(SESSION.COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const session = await getSession(token);

        if (!session.success || !session.session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await prisma.user.update({
            where: { id: session.session.userId },
            data: {
                usageCount: { increment: 1 },
                lastUsedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Usage increment API error:', error);
        return NextResponse.json(
            { error: 'Failed to update usage' },
            { status: 500 }
        );
    }
}
