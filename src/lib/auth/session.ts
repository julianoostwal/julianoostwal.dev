import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, type TokenPayload } from "./jwt";
import { randomBytes } from "crypto";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

interface CreateSessionParams {
  userId: string;
  email: string;
  role: string;
  userAgent?: string;
  ipAddress?: string;
}

export async function createSession(params: CreateSessionParams) {
  const { userId, email, role, userAgent, ipAddress } = params;

  // Generate unique session ID
  const sessionId = randomBytes(32).toString("hex");

  // Create tokens
  const tokenPayload = { userId, email, role, sessionId };
  const accessToken = await signAccessToken(tokenPayload);
  const refreshToken = await signRefreshToken(tokenPayload);

  // Store session in database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      token: accessToken,
      refreshToken,
      expiresAt,
      userAgent,
      ipAddress,
    },
  });

  // Set cookies
  const cookieStore = await cookies();
  const isSecure = process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost");
  
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  return { accessToken, refreshToken, sessionId };
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const payload = await verifyAccessToken(accessToken);
  
  if (!payload) {
    // Token is invalid, try to refresh (only works in Route Handler context)
    try {
      return await refreshSession();
    } catch {
      // Can't refresh outside Route Handler, just return null
      return null;
    }
  }

  // Verify session still exists in database
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
  });

  if (!session || session.expiresAt < new Date()) {
    // Session expired - don't try to destroy cookies here (might be in Server Component)
    return null;
  }

  return payload;
}

export async function refreshSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return null;
  }

  const payload = await verifyRefreshToken(refreshToken);

  if (!payload) {
    // Invalid refresh token - try to clean up but don't fail if we can't
    try {
      await destroySession();
    } catch {
      // Ignore cookie errors in non-Route Handler context
    }
    return null;
  }

  // Verify session in database
  const session = await prisma.session.findUnique({
    where: { 
      id: payload.sessionId,
      refreshToken,
    },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    try {
      await destroySession();
    } catch {
      // Ignore cookie errors in non-Route Handler context
    }
    return null;
  }

  // Generate new tokens
  const newTokenPayload = {
    userId: session.userId,
    email: session.user.email,
    role: session.user.role,
    sessionId: session.id,
  };

  const newAccessToken = await signAccessToken(newTokenPayload);
  const newRefreshToken = await signRefreshToken(newTokenPayload);

  // Update session in database
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.update({
    where: { id: session.id },
    data: {
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: newExpiresAt,
    },
  });

  // Update cookies
  cookieStore.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60,
    path: "/",
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return newTokenPayload;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload?.sessionId) {
      // Use deleteMany to avoid "record not found" error
      await prisma.session.deleteMany({
        where: { id: payload.sessionId },
      });
    }
  }

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}
