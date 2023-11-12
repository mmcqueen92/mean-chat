import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../data.service';
import { TokenService } from '../token.service';

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
  newGroupParticipants: string[] = [];
  newGroupName: string = '';

  constructor(
    dataService: DataService,
    private http: HttpClient,
    private tokenService: TokenService
  ) {
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
    if (!this.createGroupChatForm) {
      this.createGroupChatForm = true;
    } else {
      this.createGroupChatForm = false;
      this.newGroupParticipants = [];
      this.newGroupName = '';
    }
  }

  addToGroupChat(id: string) {
    this.newGroupParticipants.push(id);
  }

  removeFromGroupChat(id: string) {
    this.newGroupParticipants = this.newGroupParticipants.filter(
      (el) => el !== id
    );
  }

  createGroupChat() {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const participants = this.newGroupParticipants;
    const chatName = this.newGroupName;

    this.http
      .post(
        `http://localhost:3001/create-group-chat`,
        { participants, chatName },
        { headers }
      )
      .subscribe({
        next: (response: any) => {
          console.log('GROUP CHAT CREATED?: ', response);
        },
        error: (error) => {
          console.error('Group chat creation error: ', error);
        },
      });
  }
}
