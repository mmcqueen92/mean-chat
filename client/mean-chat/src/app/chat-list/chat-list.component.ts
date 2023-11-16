import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../data.service';
import { TokenService } from '../token.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { SearchDisplayComponent } from '../search-display/search-display.component';

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
  filteredContacts: any[] = [];

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

  onSearchQueryChanged(searchQuery: any) {
    
    this.filteredContacts = this.contacts.filter((contact) => {
      // check if name contains searchQuery as a substring (case-insensitive)
      return contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
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
          this.dataService.handleNewChat(response);
          this.createGroupChatForm = false;
          this.newGroupName = '';
          this.newGroupParticipants = [];
        },
        error: (error) => {
          console.error('Group chat creation error: ', error);
        },
      });
  }
}
