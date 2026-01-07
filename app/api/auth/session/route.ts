import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/auth/session';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
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

  return NextResponse.json({
    user: session?.user ?? null,
  });
}
