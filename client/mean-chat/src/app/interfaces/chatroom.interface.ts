import { User } from "./user.interface";
import { Message } from "./message.interface";
import { ChatRoomParticipant } from "./chatroom-participant.interface";

export interface ChatRoom {
    _id: string,
    name: string,
    admins: User[] | string[],
    participants: ChatRoomParticipant[],
    messages: Message[] | string[],
    lastUpdate: Date | string
}