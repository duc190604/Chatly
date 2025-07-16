// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // const cookie = request.cookies.get("next-auth.session-token");
  // console.log("cookie", cookie);
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isAuth = !!token;
  const isLoginPage = request.nextUrl.pathname.startsWith("/auth/login");

  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (isAuth && isLoginPage) {
    // Nếu đã login mà vào lại login, chuyển hướng về home
    return NextResponse.redirect(new URL("/apps/chats", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/app/:path*",
    "/app/chats/:path*",
    "/auth/login", // để xử lý cả trường hợp vào login khi đã có session
  ],
};
