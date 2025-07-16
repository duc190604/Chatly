export interface Message {
    id: string;
    content: string;
    sender: {
        id: string;
        username: string;
        avatar: string;
    };
    chat: string;
    createdAt: Date;
    updatedAt: Date;
    type: string; //"text" | "image" | "audio" | "video" | "file";
    status: string; //"sent" | "delivered" | "seen";
    isRevoked: boolean;
    isEdited: boolean;
    isError?: boolean;
}

