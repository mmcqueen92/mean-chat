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
      const chatroomIndex = currentData.chatrooms.findIndex(
        (chat: any) => chat._id === messageData.chatRoom
      );

      if (chatroomIndex > -1) {
        // Push the incoming message to the chatroom's messages array
        currentData.chatrooms[chatroomIndex].messages.push(messageData);

        // Update user data
        this.setUserData(currentData);
        this.setActiveChat(currentData.chatrooms[chatroomIndex]);
      }
    }
  }

  handleContact(contact: any) {
    const currentData = this.userDataSubject.value;
    if (
      !currentData.contacts.find(
        (existingContact: any) => existingContact._id === contact._id
      )
    ) {
      currentData.contacts.push(contact);
      this.setUserData(currentData);
    }
  }

  handleContactDeletion(deletedContactId: string) {
    const currentData = this.userDataSubject.value;

    // Remove the deleted contact from the contacts array
    currentData.contacts = currentData.contacts.filter(
      (contact: any) => contact._id !== deletedContactId
    );

    this.setUserData(currentData);
  }

  handleNewChat(chatroom: any) {
    const currentData = this.userDataSubject.value;
    if (currentData.chatrooms) {
      currentData.chatrooms.push(chatroom);
      this.setUserData(currentData);
      this.setActiveChat(chatroom);
    }
  }

  clearAllData() {
    this.userDataSubject.next(null);
    this.activeChatSubject.next(null);
  }
}
