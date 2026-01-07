// app/api/clarify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processCognition } from '@/lib/cognitive';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { USAGE, SESSION } from '@/lib/constants';

export async function POST(request: NextRequest) {
    try {
        // Fix Error 4: Extract token from cookies first
        const token = request.cookies.get(SESSION.COOKIE_NAME)?.value;
        const sessionResult = await getSession(token || '');
        
        if (!sessionResult.success || !sessionResult.session) {
            return NextResponse.json({ error: 'Please login to continue' }, { status: 401 });
        }

        // Fix Error 5: Access userId from the nested session object
        const { session } = sessionResult;
        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const isPro = user.subscriptionStatus === 'active';
        
        // Usage Gating
        if (!isPro) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (user.lastUsedAt && user.lastUsedAt < today) {
                await prisma.user.update({ where: { id: user.id }, data: { usageCount: 0 } });
            }
            if (user.usageCount >= USAGE.FREE_DAILY_LIMIT) {
                return NextResponse.json({ error: 'Daily limit reached', code: 'LIMIT_REACHED' }, { status: 403 });
            }
        }

        const body = await request.json();
        const { text } = body;

        // Fix Error 6: Pass isPro to processCognition
        const result = await processCognition({ text }, isPro);

        await prisma.user.update({
            where: { id: user.id },
            data: { usageCount: { increment: 1 }, lastUsedAt: new Date() }
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Clarify API error:', error);
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
}