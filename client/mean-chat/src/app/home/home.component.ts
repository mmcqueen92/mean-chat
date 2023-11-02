import { Component, OnInit } from '@angular/core';
import { ChatListComponent } from '../chat-list/chat-list.component';
import { ChatComponent } from '../chat/chat.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { DataService } from '../data.service';
import { TokenService } from '../token.service';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  userData: any;
  private socket: Socket | null = null;
  private webSocketInitialized = false;

  constructor(
    private dataService: DataService,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    console.log('home component initialized');
    this.dataService.userData$.subscribe((data) => {
      // Check for a valid token before initializing the WebSocket connection
      if (this.tokenService.getToken()) {
        if (!this.webSocketInitialized) {
          this.socket = io('http://localhost:3001', {
            auth: {
              token: this.tokenService.getToken(),
            },
          });
          this.socket.on('message', (data) => {
            // handle incoming messages here
          });

          this.socket.on('initial-data', (data) => {
            console.log('we got initial-data baby!!!');
            this.dataService.setUserData(data);
          });

          this.webSocketInitialized = true;
        }
        // Establish the WebSocket connection


        
      } else {
        // Token is absent or invalid, prompt the user to log in or acquire a valid token
        // You can implement a dialog, route to a login page, or display a message to the user
        console.log('Token is missing. Please log in.');
      }
    });
  }
}
