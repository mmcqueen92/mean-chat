import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../data.service';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-create-group-chat-form',
  templateUrl: './create-group-chat-form.component.html',
  styleUrls: ['./create-group-chat-form.component.css'],
})

export class CreateGroupChatFormComponent implements OnInit {
  chatrooms: any[] = [];
  contacts: any[] = [];
  filteredContacts: any[] = [];
  newGroupParticipants: string[] = [];
  newGroupName: string = '';

  constructor(
    private dataService: DataService,
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.dataService.userData$.subscribe((userData) => {
      if (userData) {
        this.chatrooms = userData.chatrooms;
        this.contacts = userData.contacts;
        this.filteredContacts = userData.contacts;
      } else {
        this.chatrooms = [];
      }
    });
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
          this.newGroupName = '';
          this.newGroupParticipants = [];
        },
        error: (error) => {
          console.error('Group chat creation error: ', error);
        },
      });
  }
}
