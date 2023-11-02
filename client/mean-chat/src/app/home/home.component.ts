import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
    private tokenService: TokenService,
    private router: Router,
  ) {}

  ngOnInit() {
    console.log('home component initialized');
    this.dataService.userData$.subscribe((data) => {
      // check for token
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
            console.log('initial-data received');
            this.dataService.setUserData(data);
          });

          this.webSocketInitialized = true;
        }
      } else {
        console.log('Token is missing. Please log in.');
      }
    });
  }

  logout() {
    this.tokenService.clearToken();
    this.router.navigate(['/login']);
  }
}
