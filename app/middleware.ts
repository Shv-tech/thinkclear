import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION } from '@/lib/constants';

// Middleware for route protection and session handling
// Runs on Edge, before API routes

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't need authentication
    const publicRoutes = [
        '/',
        '/api/clarify',
        '/api/auth/magic-link',
        '/api/auth/verify',
        '/api/payments/webhook', // Webhook must be public for Razorpay
    ];

    // Check if current path is public
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    );

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Protected routes check for session cookie
    const sessionToken = request.cookies.get(SESSION.COOKIE_NAME)?.value;

    if (!sessionToken) {
        // For API routes, return 401
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // For pages, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Session token exists, allow request
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all API routes except public ones
        '/api/((?!clarify|auth|payments/webhook).*)',
        // Match protected pages if any
        '/dashboard/:path*',
        '/settings/:path*',
    ],
};
