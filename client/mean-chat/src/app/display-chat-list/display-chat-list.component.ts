import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { User } from '../interfaces/user.interface';
import { ChatRoom } from '../interfaces/chatroom.interface';
import { ChatRoomParticipant } from '../interfaces/chatroom-participant.interface';

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

  getParticipants(chatroom: string | ChatRoom): ChatRoomParticipant[] {
    return typeof chatroom === 'string' ? [] : chatroom.participants;
  }

  setActiveChat(chat: ChatRoom) {
    this.dataService.setActiveChat(chat);
  }
}
