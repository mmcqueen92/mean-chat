import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})
export class ChatListComponent implements OnInit {
  chatrooms: any[] = [];
  contacts: any[] = [];
  public dataService: DataService;
  createGroupChatForm = false;
  newGroupChat: any[] = [];

  constructor(dataService: DataService) {
    this.dataService = dataService;
  }

  ngOnInit(): void {
    this.dataService.userData$.subscribe((userData) => {
      if (userData) {
        this.chatrooms = userData.chatrooms;
        this.contacts = userData.contacts;
      } else {
        this.chatrooms = [];
      }
    });
  }

  setActiveChat(chat: any) {
    this.dataService.setActiveChat(chat);
  }

  toggleGroupChatForm() {
    !this.createGroupChatForm
      ? (this.createGroupChatForm = true)
      : (this.createGroupChatForm = false);
  }

  addToGroupChat(id: string) {
    this.newGroupChat.push(id);
  }

  removeFromGroupChat(id: string) {
    this.newGroupChat = this.newGroupChat.filter((el) => el !== id);
  }
}