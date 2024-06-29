import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { TokenService } from '../../services/token.service';
import { io, Socket } from 'socket.io-client';
import { User } from '../../interfaces/user.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  userData!: User;
  private socket: Socket | null = null;
  private webSocketInitialized = false;
  private userDataSubscription: Subscription | null = null;

  constructor(
    private dataService: DataService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userDataSubscription = this.dataService.userData$.subscribe((data) => {
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

            this.dataService.handleMessage(data);
          });

          this.socket.on('initial-data', (data) => {
            console.log("SET INITIAL DATA: ", data)
            this.dataService.setUserData(data);
            this.userData = data;
          });

          this.webSocketInitialized = true;
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }

    if (this.socket) {
      this.socket.disconnect();
    }
  }

  logout(): void {
    this.tokenService.clearToken();
    this.dataService.clearAllData();
    this.router.navigate(['/login']);
  }
}
