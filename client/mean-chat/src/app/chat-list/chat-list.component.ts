import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})
export class ChatListComponent implements OnInit {
  chatrooms: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.userData$.subscribe((userData) => {
      if (userData) {
        this.chatrooms = userData.chatrooms;
      } else {
        this.chatrooms = [];
      }
    });
  }
  setActiveChat(chat: any) {
    this.dataService.setActiveChat(chat);
  }
}