import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import { prisma } from '@/lib/db';
import { hashToken } from '@/lib/auth';



export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const RESEND_KEY = process.env.RESEND_API_KEY;
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

    if (!RESEND_KEY || !APP_URL) {
      console.error('Missing env vars');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const resend = new Resend(RESEND_KEY);

    // Ensure user exists
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    // Create secure token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(rawToken);

    await prisma.magicLink.create({
      data: {
        email,
        token: hashedToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    const loginUrl = `${APP_URL}/api/auth/verify?token=${rawToken}`;

    // Send magic link
    await resend.emails.send({
      from: 'ThinkClear <onboarding@resend.dev>',
      to: email,
      subject: 'Your ThinkClear login link',
      html: magicLinkEmail(loginUrl),
    });

    // Optional welcome email (SAFE: send every time or remove)
    await resend.emails.send({
      from: 'ThinkClear <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to ThinkClear',
      html: welcomeEmail(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Magic link error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* ---------------- EMAIL TEMPLATES ---------------- */

function magicLinkEmail(url: string) {
  return `
  <div style="font-family:Inter,system-ui;background:#0e0e12;color:#fff;padding:40px">
    <h2>Sign in to ThinkClear</h2>
    <p>No passwords. No feeds. Just clarity.</p>
    <a href="${url}"
       style="display:inline-block;margin-top:24px;
              padding:14px 22px;
              background:#e6dcc8;
              color:#111;
              border-radius:12px;
              text-decoration:none">
      Continue to ThinkClear
    </a>
    <p style="margin-top:24px;opacity:.6">
      This link expires in 15 minutes.
    </p>
  </div>
  `;
}

function welcomeEmail() {
  return `
  <div style="font-family:Inter,system-ui;background:#0b0b10;color:#fff;padding:40px">
    <h1>Welcome to ThinkClear</h1>
    <p>
      A quiet space to untangle thoughts.
      No noise. No judgement.
    </p>
  </div>
  `;
}
