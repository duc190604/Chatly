// lib/axios/serverWrapped.ts
import axios, { AxiosInstance } from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { decode, encode } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function createServerAxios(): Promise<AxiosInstance> {
  const session = await getServerSession(authOptions);
  let accessToken = session?.user?.accessToken;

  const instance = axios.create({
    baseURL: process.env.SERVER_API_URL,
  });

  // Gắn accessToken ban đầu
  instance.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Interceptor xử lý lỗi và tự refresh token nếu cần
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const res = await axios.post(`${process.env.SERVER_API_URL}/api/auth/refresh-token`, {
            refreshToken: session?.user?.refreshToken,
          });
          const newAccessToken = res.data?.data?.accessToken;
          if (newAccessToken) {
            accessToken = newAccessToken;
            const cookieStore = cookies();
            const sessionToken = (await cookieStore).get("next-auth.session-token")?.value;

            if (sessionToken) {
              const oldToken = await decode({
                token: sessionToken,
                secret: process.env.NEXTAUTH_SECRET!,
              });

              if (oldToken) {
                const newToken = await encode({
                  token: {
                    ...oldToken,
                    accessToken: newAccessToken,
                  },
                  secret: process.env.NEXTAUTH_SECRET!,
                });

                (await cookieStore).set("next-auth.session-token", newToken, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "lax",
                  path: "/",
                });
              }
            }
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          throw {
            status: 401,
            message: "Unauthorized. Please log in again.",
          };
        }
      }

      throw {
        status: error.response?.status || 500,
        message: error.response?.data?.error?.message || error.message || "Server error",
      };
    }
  );

  return instance;
}
