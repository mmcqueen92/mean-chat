import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})
export class ChatListComponent implements OnInit {
  chatrooms: any[] = [];
  public dataService: DataService;

  constructor(dataService: DataService) {
    this.dataService = dataService;
  }

  ngOnInit(): void {
    this.dataService.userData$.subscribe((userData) => {
      console.log("updating userdata?")
      if (userData) {
        this.chatrooms = userData.chatrooms;
        console.log("new chatrooms in chat-list: ", this.chatrooms)
      } else {
        this.chatrooms = [];
      }
    });
  }
  setActiveChat(chat: any) {
    this.dataService.setActiveChat(chat);
  }
}