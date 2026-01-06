// Authentication Library - THINKCLEAR v3
// Magic link email authentication
// No passwords, no tracking

import { randomBytes, createHash } from 'crypto';
import { prisma } from '../db';
import { SESSION } from '../constants';

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

/**
 * Generate a secure random token
 */
export function generateToken(): string {
    return randomBytes(32).toString('hex');
}

/**
 * Hash a token for secure storage
 */
export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

/**
 * Create a magic link for email authentication
 */
export async function createMagicLink(email: string): Promise<MagicLinkResult> {
    try {
        const token = generateToken();
        const hashedToken = hashToken(token);

        const expiresAt = new Date(
            Date.now() + SESSION.MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000
        );

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: { email },
            });
        }

        // Create magic link
        await prisma.magicLink.create({
            data: {
                email,
                token: hashedToken,
                expiresAt,
                userId: user.id,
            },
        });

        // Return unhashed token for email
        return { success: true, token };
    } catch (error) {
        console.error('Failed to create magic link:', error);
        return { success: false, error: 'Failed to create magic link' };
    }
}

/**
 * Verify magic link and create session
 */
export async function verifyMagicLink(token: string): Promise<SessionResult> {
    try {
        const hashedToken = hashToken(token);

        const magicLink = await prisma.magicLink.findUnique({
            where: { token: hashedToken },
            include: { user: true },
        });

        if (!magicLink) {
            return { success: false, error: 'Invalid or expired link' };
        }

        if (magicLink.usedAt) {
            return { success: false, error: 'Link already used' };
        }

        if (new Date() > magicLink.expiresAt) {
            return { success: false, error: 'Link expired' };
        }

        // Mark as used
        await prisma.magicLink.update({
            where: { id: magicLink.id },
            data: { usedAt: new Date() },
        });

        // Create session
        const sessionToken = generateToken();
        const hashedSessionToken = hashToken(sessionToken);

        const expiresAt = new Date(
            Date.now() + SESSION.MAX_AGE_SECONDS * 1000
        );

        // Get or create user
        let user = magicLink.user;
        if (!user) {
            user = await prisma.user.upsert({
                where: { email: magicLink.email },
                update: {},
                create: { email: magicLink.email },
            });
        }

        const session = await prisma.session.create({
            data: {
                token: hashedSessionToken,
                expiresAt,
                userId: user.id,
            },
        });

        return {
            success: true,
            session: {
                id: sessionToken, // Return unhashed for cookie
                userId: user.id,
                email: user.email,
            },
        };
    } catch (error) {
        console.error('Failed to verify magic link:', error);
        return { success: false, error: 'Verification failed' };
    }
}

/**
 * Get session from token
 */
export async function getSession(token: string): Promise<SessionResult> {
    try {
        const hashedToken = hashToken(token);

        const session = await prisma.session.findUnique({
            where: { token: hashedToken },
            include: { user: true },
        });

        if (!session) {
            return { success: false, error: 'Session not found' };
        }

        if (new Date() > session.expiresAt) {
            // Clean up expired session
            await prisma.session.delete({ where: { id: session.id } });
            return { success: false, error: 'Session expired' };
        }

        return {
            success: true,
            session: {
                id: session.id,
                userId: session.userId,
                email: session.user.email,
            },
        };
    } catch (error) {
        console.error('Failed to get session:', error);
        return { success: false, error: 'Session lookup failed' };
    }
}

/**
 * Delete session (logout)
 */
export async function deleteSession(token: string): Promise<boolean> {
    try {
        const hashedToken = hashToken(token);
        await prisma.session.delete({ where: { token: hashedToken } });
        return true;
    } catch {
        return false;
    }
}

/**
 * Get user by ID with subscription status
 */
export async function getUserById(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            subscriptionStatus: true,
            usageCount: true,
            lastUsedAt: true,
        },
    });
}
