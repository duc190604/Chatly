// lib/auth.ts
import axios from "axios";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate user tại đây 
        try {
          const response = await axios.post(`${process.env.SERVER_API_URL}/api/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });
          const data = response.data.data;
          if (response.status === 200) {
            return {
              id: data.user.id,
              username: data.user.username,
              email: data.user.email,
              avatar: data.user.avatar,
              birthday: data.user.birthday,
              description: data.user?.description || "",
              status: data.user?.status || "",
              coverImage: data.user?.coverImage || "",
              userBlocked: data.user?.userBlocked || [],
              chatBlocked: data.user?.chatBlocked || [],
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              lastSeen: data.user?.lastSeen || null,
            };
          }
        } catch (error: any) {
          console.log(error);
          return null;
        }
        return null; // nếu return null → đăng nhập thất bại
      },
    }),
  ],
  pages: {
    signIn: "/auth/login", // trang login custom
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
    updateAge: 30 * 60
  },

  callbacks: {
    async jwt({ token, user }) {//user trả về khi thực hiện login còn với Oauth thì là account
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.avatar = user.avatar;
        token.birthday = user.birthday;
        token.description = user.description;
        token.status = user.status;
        token.coverImage = user.coverImage;
        token.userBlocked = user.userBlocked;
        token.chatBlocked = user.chatBlocked;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.lastSeen = user.lastSeen;
      } 
      // else {
      //   try {
      //     console.log("Refreshing token...");
      //     const res = await axios.post(
      //       `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`,
      //       {
      //         refreshToken: token.refreshToken,
      //       }
      //     );
      //     const newAccessToken = res.data.data.accessToken;
      //     token.accessToken = newAccessToken
      //   } catch (err) {
      //     token.error = "refresh token failed";
      //   }
      // }
      return token;
    },
    async session({ session, token }) {
      if (token.error) {
        session.error = token.error;
      }
      if (session.user) {//khi nào login rồi thì mới tồn tại session.user
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.avatar = token.avatar;
        session.user.birthday = token.birthday as Date;
        session.user.description = token.description;
        session.user.coverImage = token.coverImage;
        session.user.status = token.status;
        session.user.userBlocked = token.userBlocked;
        session.user.chatBlocked = token.chatBlocked;
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        session.user.lastSeen = token.lastSeen;
      }
      return session;
    },
  },
};
