import { Message } from "./message.interface"
import { ChatRoom } from "./chatroom.interface"

export interface User {
    _id: string,
    name: string,
    email: string,
    __v: number,
    contacts?: User[] | string[],
    chatrooms: ChatRoom[] | string[]
}