export interface User {
    id: string;
    username: string;
    email: string;
    avatar: string;
    birthday: Date;
    coverImage: string;
    status?: string;
    description?: string;
    createdAt: Date;
    userBlocked?: string[];
    chatBlocked?: string[];
    lastSeen?: string;
}
