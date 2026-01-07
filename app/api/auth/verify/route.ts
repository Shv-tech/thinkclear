import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.redirect('/');

  const hashedToken = hashToken(token);

  const magicLink = await prisma.magicLink.findFirst({
    where: {
      token: hashedToken,
      expiresAt: { gt: new Date() },
      usedAt: null,
    },
  });

  if (!magicLink || !magicLink.userId) {
    return NextResponse.redirect('/?error=invalid-link');
  }

  // Create session
  const sessionToken = crypto.randomUUID();

  await prisma.session.create({
    data: {
      token: sessionToken,
      userId: magicLink.userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Mark magic link as used (DO NOT DELETE)
  await prisma.magicLink.update({
    where: { id: magicLink.id },
    data: { usedAt: new Date() },
  });

  const res = NextResponse.redirect('/');
  res.cookies.set('tc_session', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });

  return res;
}
