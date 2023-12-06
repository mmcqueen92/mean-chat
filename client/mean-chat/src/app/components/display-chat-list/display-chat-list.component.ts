import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { User } from '../../interfaces/user.interface';
import { ChatRoom } from '../../interfaces/chatroom.interface';
import { ChatRoomParticipant } from '../../interfaces/chatroom-participant.interface';

@Component({
  selector: 'app-display-chat-list',
  templateUrl: './display-chat-list.component.html',
  styleUrls: ['./display-chat-list.component.css'],
})
export class DisplayChatListComponent implements OnInit {
  currentUser!: User;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.userData$.subscribe((userData) => {
      if (userData) {
        this.currentUser = userData;

        if (this.isChatRoomObjectArray(this.currentUser.chatrooms)) {
          this.currentUser.chatrooms.sort((a: ChatRoom, b: ChatRoom) => {
            const dateA = new Date(a.lastUpdate);
            const dateB = new Date(b.lastUpdate);

            return dateB.getTime() - dateA.getTime();
          });
        }
      }
    });
  }

  isChatRoomObjectArray(
    chatrooms: (ChatRoom | string)[]
  ): chatrooms is ChatRoom[] {
    return chatrooms.every((chatroom) => typeof chatroom !== 'string');
  }

  getNonUserParticipants(chatroom: string | ChatRoom): ChatRoomParticipant[] {
    let nonUserParticipants =
      typeof chatroom === 'string' ? [] : chatroom.participants;

    nonUserParticipants = nonUserParticipants.filter(
      (participant: ChatRoomParticipant) => {
        return participant.user._id !== this.currentUser._id;
      }
    );

    return nonUserParticipants;
  }

  unreadMessages(chatRoom: ChatRoom): boolean {
    if(chatRoom.messages.length < 1) {
      return false;
    }

    const userId = this.currentUser._id;

    // Find the participant element in the participants array with a "user._id" value equal to userId
    const participant = chatRoom.participants.find(
      (participant) => participant.user._id === userId
    );

    if (participant) {
      // Retrieve the "lastVisit" value from that element (date string)
      const lastVisitDateString = participant.lastVisit;

      // Compare the lastVisit date string to the chatRoom's "lastUpdate" date string
      const lastVisitDate = new Date(lastVisitDateString);
      const lastUpdateDate = new Date(chatRoom.lastUpdate);

      // If the "lastVisit" date is earlier than "lastUpdate" date, return true
      return lastVisitDate < lastUpdateDate;
    }

    // If participant is not found, consider it as having unread messages
    return true;
  }

  setActiveChat(chat: ChatRoom) {
    this.dataService.setActiveChat(chat);
  }
}
