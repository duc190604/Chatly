import { Message } from "./messages";
import { User } from "./user";

export interface Chat {
    id: string;
    name: string;
    lastMessage: Message;
    avatar: string;
    members: User[];
    isOnline: boolean;
    isGroup: boolean;
}
