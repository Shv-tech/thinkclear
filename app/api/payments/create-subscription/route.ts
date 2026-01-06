import { NextRequest, NextResponse } from 'next/server';
import { createSubscription, getRazorpayKeyId } from '@/lib/payments';
import { getSession } from '@/lib/auth';
import { SESSION } from '@/lib/constants';

// POST /api/payments/create-subscription
// Create a Razorpay subscription or order

export async function POST(request: NextRequest) {
    try {
        // Get session
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

        const body = await request.json();
        const { planType } = body;

        if (!planType || !['monthly', 'weekly'].includes(planType)) {
            return NextResponse.json(
                { error: 'Invalid plan type' },
                { status: 400 }
            );
        }

        const result = await createSubscription(
            session.session.userId,
            planType as 'monthly' | 'weekly'
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to create subscription' },
                { status: 500 }
            );
        }

        // Return subscription/order ID and Razorpay key for frontend
        return NextResponse.json({
            success: true,
            subscriptionId: result.subscriptionId,
            orderId: result.orderId,
            keyId: getRazorpayKeyId(),
        });
    } catch (error) {
        console.error('Create subscription API error:', error);
        return NextResponse.json(
            { error: 'Failed to create subscription' },
            { status: 500 }
        );
    }
}
