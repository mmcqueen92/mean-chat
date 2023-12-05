import { Message } from "./message.interface";
import { ChatRoom } from "./chatroom.interface";

export interface EmittedMessageData {
    newMessage: Message,
    chatroom: ChatRoom
}