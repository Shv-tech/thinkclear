import { NextRequest, NextResponse } from 'next/server';
import {
    verifyWebhookSignature,
    handleSubscriptionActivated,
    handleSubscriptionCancelled,
    handlePaymentCaptured,
} from '@/lib/payments';

// POST /api/payments/webhook
// Razorpay webhook handler - must be public

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        if (!signature) {
            console.warn('Webhook missing signature');
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 400 }
            );
        }

        // Verify webhook signature
        const isValid = verifyWebhookSignature(body, signature);

        if (!isValid) {
            console.warn('Webhook signature verification failed');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        const event = JSON.parse(body);
        const eventType = event.event;

        console.log('Razorpay webhook received:', eventType);

        // Handle different event types
        switch (eventType) {
            case 'subscription.activated':
                await handleSubscriptionActivated(
                    event.payload.subscription.entity.id,
                    event.payload.subscription.entity.customer_id
                );
                break;

            case 'subscription.cancelled':
            case 'subscription.completed':
            case 'subscription.expired':
                await handleSubscriptionCancelled(
                    event.payload.subscription.entity.id
                );
                break;

            case 'payment.captured':
                // Handle one-time payment (7-day pass)
                const notes = event.payload.payment.entity.notes;
                if (notes?.type === 'weekly_pass' && notes?.userId) {
                    await handlePaymentCaptured(
                        event.payload.payment.entity.order_id,
                        notes.userId
                    );
                }
                break;

            default:
                console.log('Unhandled webhook event:', eventType);
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook API error:', error);
        // Still return 200 to prevent retries on parse errors
        return NextResponse.json({ received: true });
    }
}

// Reject GET requests
export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}
