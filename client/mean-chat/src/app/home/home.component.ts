import { Component, OnInit } from '@angular/core';
import { ChatListComponent } from '../chat-list/chat-list.component';
import { ChatComponent } from '../chat/chat.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { io } from 'socket.io-client';

const token = localStorage.getItem('mean-chat-token');

let tokenData;

if (token) {
  tokenData = JSON.parse(atob(token.split('.')[1]));
}

const userId = tokenData.userId;



const socket = io('http://localhost:3001', {
  query: { userId },
});

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  ngOnInit() {
    socket.on('message', (data) => {
      // handle incoming messages here
    });
  }



}
