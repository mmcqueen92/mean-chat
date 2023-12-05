import { User } from "./user.interface";
import { ChatRoom } from "./chatroom.interface";

export interface Message {
    text: string,
    sender: User | string,
    chatRoom: ChatRoom | string,
    timestamp: Date | string
}