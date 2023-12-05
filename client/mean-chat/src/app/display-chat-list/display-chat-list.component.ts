import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-display-chat-list',
  templateUrl: './display-chat-list.component.html',
  styleUrls: ['./display-chat-list.component.css'],
})
export class DisplayChatListComponent implements OnInit {
  currentUser: any = {
    _id: null,
    chatrooms: [],
    contacts: [],
    email: null,
    name: null,
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.userData$.subscribe((userData) => {
      if (userData) {
        this.currentUser = userData;

        for (const chatroom of this.currentUser.chatrooms) {
          chatroom.filteredParticipants = chatroom.participants.filter(
            (participant: any) => participant.user._id !== this.currentUser._id
          );
        }

        this.currentUser.chatrooms.sort((a: any, b: any) => {
          const dateA = new Date(a.lastUpdate);
          const dateB = new Date(b.lastUpdate);

          return dateB.getTime() - dateA.getTime();
        });
      }
    });
  }

  setActiveChat(chat: any) {
    this.dataService.setActiveChat(chat);
  }
}
