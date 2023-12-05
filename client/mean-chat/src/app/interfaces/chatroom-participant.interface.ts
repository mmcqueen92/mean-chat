import { User } from "./user.interface";

export interface ChatRoomParticipant {
    user: User,
    lastVisit: Date | string
}