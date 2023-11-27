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
      }
    });
  }

  setActiveChat(chat: any) {
    this.dataService.setActiveChat(chat);
  }
}
