export * from "./chat";
export * from "./messages";

export interface PaginationCursor {
  hasNext: boolean;
  nextCursor?: string;
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    email: string;
    avatar: string;
    description?: string;
    coverImage?: string;
    status?: string;
    userBlocked?: string[];
    chatBlocked?: string[];
    accessToken: string;
    refreshToken: string;
    lastSeen?: string;
    error?:string
    
  }
}

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    email: string;
    avatar: string;
    birthday?: Date;
    description?: string;
    coverImage?: string;
    status?: string;
    userBlocked?: string[];
    chatBlocked?: string[];
    accessToken: string;
    refreshToken: string;
    lastSeen?: string;
  }
  interface Session {
    user: User;
    error?:string
  }
}
