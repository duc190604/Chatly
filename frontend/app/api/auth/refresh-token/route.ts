// app/api/auth/refresh-token/route.ts
import { cookies } from "next/headers";
import { decode, encode } from "next-auth/jwt";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST() {
  const cookieStore = cookies();

  // Lấy JWT token cũ từ cookie (NextAuth mặc định là 'next-auth.session-token')
  const tokenFromCookie = (await cookieStore).get("next-auth.session-token")?.value;

  if (!tokenFromCookie) {
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  // Giải mã token cũ để lấy thông tin người dùng và refresh token
  const oldToken = await decode({
    token: tokenFromCookie,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  if (!oldToken?.refreshToken) {
    return NextResponse.json({ error: "No refresh token found" }, { status: 401 });
  }

  try {
    // Gọi BE để làm mới access token
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
      refreshToken: oldToken.refreshToken,
    });
    const newAccessToken = res.data.data.accessToken;
    const newToken = await encode({
      secret: process.env.NEXTAUTH_SECRET!,
      token: {
        ...oldToken, // Giữ nguyên các thông tin khác từ token cũ
        accessToken: newAccessToken,
      },
    });

    (await cookies()).set("next-auth.session-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 });
  }
}