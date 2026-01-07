import { NextRequest, NextResponse } from "next/server";
import { getSession, deleteSession, getUserById } from "../../../../lib/auth/index";

// define SESSION exactly how your code expects it
const SESSION = {
  COOKIE_NAME: "thinkclear_session",
};
// app/api/auth/session/route.ts
export async function GET(request: NextRequest) {
    const token = request.cookies.get(SESSION.COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ authenticated: false, user: null });

    const result = await getSession(token);
    if (!result.success || !result.session) return NextResponse.json({ authenticated: false, user: null });

    const user = await getUserById(result.session.userId);
    return NextResponse.json({ authenticated: true, user });
}

// app/api/auth/logout/route.ts
export async function POST(request: NextRequest) {
    const token = request.cookies.get(SESSION.COOKIE_NAME)?.value;
    if (token) await deleteSession(token);

    const response = NextResponse.json({ success: true });
    response.cookies.set({ name: SESSION.COOKIE_NAME, value: '', expires: new Date(0), path: '/' });
    return response;
}
