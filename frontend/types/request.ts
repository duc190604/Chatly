import { User } from "./user";
export interface Request {
    id: string;
    sender: User;
    recipient: User;
    status: string; //"pending" | "accepted" | "rejected";
    message:string;
    createdAt: Date;
}