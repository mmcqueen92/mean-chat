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

  constructor(private dataService: DataService, private http: HttpClient) {}

  ngOnInit(): void {
    this.dataService.activeChat$.subscribe((activeChat) => {
      // Update the chat component based on the active chat
      if (activeChat) {
        // Update the UI with messages, participants, etc.
        this.messages = activeChat.messages;
      } else {
        // Handle the case when no chat is active
        this.messages = [];
      }
    });
  }

  sendMessage() {
    const messageData = {
      text: this.messageText,
      recipientId: this.recipientId,
    };

    this.http
      .post('http://localhost:3001/messages/new', messageData)
      .subscribe((response) => {
        this.messageText = '';
      });
  }
}
