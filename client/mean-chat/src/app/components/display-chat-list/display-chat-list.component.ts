import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../services/data.service';
import { User } from '../../interfaces/user.interface';
import { ChatRoom } from '../../interfaces/chatroom.interface';
import { ChatRoomParticipant } from '../../interfaces/chatroom-participant.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-display-chat-list',
  templateUrl: './display-chat-list.component.html',
  styleUrls: ['./display-chat-list.component.css'],
})
export class DisplayChatListComponent implements OnInit, OnDestroy {
  currentUser!: User;
  private userDataSubscription: Subscription | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.userDataSubscription = this.dataService.userData$.subscribe(
      (userData) => {
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
      }
    );
  }

  ngOnDestroy() {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
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
    if (chatRoom.messages.length < 1) {
      return false;
    }

    const userId = this.currentUser._id;

    const participant = chatRoom.participants.find(
      (participant) => participant.user._id === userId
    );

    if (participant) {
      const lastVisitDateString = participant.lastVisit;

      const lastVisitDate = new Date(lastVisitDateString);
      const lastUpdateDate = new Date(chatRoom.lastUpdate);

      return lastVisitDate < lastUpdateDate;
    }

    return true;
  }

  setActiveChat(chat: ChatRoom): void {
    this.dataService.setActiveChat(chat);
  }
}
