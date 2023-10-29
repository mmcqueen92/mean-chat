// chat.component.ts
import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  messageText: string = '';
  recipientId: string = '';

  constructor(private dataService: DataService, private http: HttpClient) {}

  sendMessage() {
    
    const messageData = {
      text: this.messageText,
      recipientId: this.recipientId, 
    };

    
    this.http.post('http://localhost:3001/messages/new', messageData).subscribe((response) => {
      
      this.messageText = '';
    });
  }
}
