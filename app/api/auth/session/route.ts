import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { hashToken } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies(); // ✅ FIX
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const session = await prisma.session.findFirst({
    where: {
      token: hashToken(token),
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      subscriptionStatus: session.user.subscriptionStatus,
      usageCount: session.user.usageCount,
    },
  });
}
