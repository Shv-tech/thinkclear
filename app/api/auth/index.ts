// lib/auth/index.ts
import { randomBytes, createHash } from 'crypto';
import { prisma } from '../../../lib/prisma';
import { SESSION } from '../../../lib/constants';
export const dynamic = 'force-dynamic';
export interface MagicLinkResult {
    success: boolean;
    token?: string;
    error?: string;
}

export interface SessionResult {
    success: boolean;
    session?: {
        id: string;
        userId: string;
        email: string;
    };
    error?: string;
}

export function generateToken(): string {
    return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

/**
 * Creates a magic link and saves a hashed version to the DB for security.
 */
export async function createMagicLink(email: string): Promise<MagicLinkResult> {
    try {
        const token = generateToken();
        const hashedToken = hashToken(token);
        const expiresAt = new Date(Date.now() + SESSION.MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({ data: { email } });
        }

        await prisma.magicLink.create({
            data: {
                email,
                token: hashedToken,
                expiresAt,
                userId: user.id,
            },
        });

        return { success: true, token }; // Return unhashed token for the email link
    } catch (error) {
        console.error('Failed to create magic link:', error);
        return { success: false, error: 'Failed to create magic link' };
    }
}

/**
 * Verifies the token and upgrades the connection to a full Session.
 */
export async function verifyMagicLink(token: string): Promise<SessionResult> {
    try {
        const hashedToken = hashToken(token);
        const magicLink = await prisma.magicLink.findUnique({
            where: { token: hashedToken },
            include: { user: true },
        });

        if (!magicLink || magicLink.usedAt || new Date() > magicLink.expiresAt) {
            return { success: false, error: 'Invalid or expired link' };
        }

        // Invalidate magic link immediately
        await prisma.magicLink.update({
            where: { id: magicLink.id },
            data: { usedAt: new Date() },
        });

        const sessionToken = generateToken();
        const hashedSessionToken = hashToken(sessionToken);
        const expiresAt = new Date(Date.now() + SESSION.MAX_AGE_SECONDS * 1000);

        const session = await prisma.session.create({
            data: {
                token: hashedSessionToken,
                expiresAt,
                userId: magicLink.userId!,
            },
        });

        return {
            success: true,
            session: { id: sessionToken, userId: session.userId, email: magicLink.email },
        };
    } catch (error) {
        console.error('Failed to verify magic link:', error);
        return { success: false, error: 'Verification failed' };
    }
}

export async function getSession(token: string): Promise<SessionResult> {
    try {
        const hashedToken = hashToken(token);
        const session = await prisma.session.findUnique({
            where: { token: hashedToken },
            include: { user: true },
        });

        if (!session || new Date() > session.expiresAt) {
            if (session) await prisma.session.delete({ where: { id: session.id } });
            return { success: false, error: 'Session expired' };
        }

        return {
            success: true,
            session: { id: session.id, userId: session.userId, email: session.user.email },
        };
    } catch (error) {
        return { success: false, error: 'Session lookup failed' };
    }
}

export async function deleteSession(token: string): Promise<boolean> {
    try {
        const hashedToken = hashToken(token);
        await prisma.session.delete({ where: { token: hashedToken } });
        return true;
    } catch {
        return false;
    }
}

export async function getUserById(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, subscriptionStatus: true, usageCount: true },
    });
}