// chat.component.ts
import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  messageText: string = '';
  recipientId: string = '';
  messages: any[] = [];
  participants: any[] = [];
  activeChat: any;
  currentUser: string = '';
  participantData: any[] = [];

  constructor(private dataService: DataService, private http: HttpClient) {}

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
        console.log('MESSAGES: ', this.messages);
        console.log('PARTICIPANTS DATA: ', this.participantData);
      } else {
        this.messages = [];
        this.participants = [];
      }
    });

    this.dataService.userData$.subscribe((userData) => {
      if (userData) {
        this.currentUser = userData._id;
      }
    });
  }

  sendMessage() {
    const messageData = {
      text: this.messageText,
      chatRoom: this.activeChat._id,
      sender: this.currentUser,
    };

    this.http
      .post('http://localhost:3001/messages/new', messageData)
      .subscribe((response) => {
        this.messageText = '';
      });
  }
}
