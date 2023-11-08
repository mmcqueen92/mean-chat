// chat.component.ts
import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { TokenService } from '../token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  messageText: string = '';
  recipients: any[] = [];
  messages: any[] = [];
  participants: any[] = [];
  activeChat: any;
  currentUser: any = {};
  participantData: any[] = [];

  constructor(
    private dataService: DataService,
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  getSenderData(senderId: string) {
    const sender = this.activeChat.participants.find((participant: any) => {
      return participant._id === senderId;
    });

    if (sender) {
      return { _id: sender._id, name: sender.name };
    }

    return null; // Handle the case where sender data is not found
  }

  ngOnInit(): void {
    this.dataService.activeChat$.subscribe((activeChat) => {
      this.activeChat = activeChat;
      console.log('ACTIVE CHAT: ', this.activeChat);

      if (activeChat) {
        this.messages = activeChat.messages.map((message: any) => ({
          ...message,
          sender: this.getSenderData(message.sender),
        }));

        this.participantData = activeChat.participants;

        this.participants = activeChat.participants.filter(
          (participant: any) => {
            return participant._id !== this.dataService.getUserData()._id;
          }
        );
        console.log('PARTICIPANTS: ', this.participants);

        if (this.participants && this.currentUser) {
          console.log('PARTICIPANTS + CURRENTUSER');

          this.participants = this.participants.map((participant: any) => {
            participant.inUserContacts = this.currentUser.contacts.some(
              (contact: any) => contact._id === participant._id
            );
            return participant;
          });

          console.log('Updated PARTICIPANTS: ', this.participants);
        }
      } else {
        this.messages = [];
        this.participants = [];
      }
    });

    this.dataService.userData$.subscribe((userData) => {
      if (userData) {
        this.currentUser = userData;
        console.log('CURRENT USER: ', this.currentUser);
      }
    });
  }

  sendMessage() {
    const messageData = {
      text: this.messageText,
      chatRoom: this.activeChat._id,
      sender: this.currentUser._id,
      token: this.tokenService.getToken(),
    };

    this.http
      .post('http://localhost:3001/messages/new', messageData)
      .subscribe((response) => {
        this.messageText = '';
      });
  }

  addToContacts(contactEmail: string) {
    console.log(contactEmail);
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const newContactEmail = contactEmail;

    this.http
      .post(
        'http://localhost:3001/add-contact',
        { newContactEmail },
        { headers }
      )
      .subscribe({
        next: (response: any) => {
          console.log('Contact added?', response.newContact);
          this.dataService.handleContact(response.newContact);
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
  }
}
