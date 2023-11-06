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

  handleMessage(messageData: any) {
    const currentData = this.userDataSubject.value;
    if (currentData && currentData.chatrooms) {
      const chatroom = currentData.chatrooms.find(
        (chat: any) => chat._id === messageData.chatRoom
      );

      if (chatroom) {
        // Push the incoming message to the chatroom's messages array
        chatroom.messages.push(messageData);

        // Update user data
        this.setUserData(currentData);
      }
    }
  }
}
