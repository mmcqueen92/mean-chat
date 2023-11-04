// data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private userDataSubject = new BehaviorSubject<any>(null);
  public userData$ = this.userDataSubject.asObservable();
  private activeChatSubject = new BehaviorSubject<any>(null);
  public activeChat$ = this.activeChatSubject.asObservable();

  setUserData(data: any) {
    this.userDataSubject.next(data);
  }

  setActiveChat(chat: any) {
    this.activeChatSubject.next(chat);
  }

  getUserData() {
    return this.userDataSubject.value;
  }
}
