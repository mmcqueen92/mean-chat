import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from './token.service';
import { User } from './interfaces/user.interface';
import { ChatRoom } from './interfaces/chatroom.interface';
import { EmittedMessageData } from './interfaces/emitted-message-data.interface';
import { ChatRoomParticipant } from './interfaces/chatroom-participant.interface';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private userDataSubject = new BehaviorSubject<any>(null);
  public userData$ = this.userDataSubject.asObservable();
  private activeChatSubject = new BehaviorSubject<any>(null);
  public activeChat$ = this.activeChatSubject.asObservable();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  setUserData(data: User) {
    this.userDataSubject.next(data);
  }

  setActiveChat(chat: ChatRoom | null) {
    this.activeChatSubject.next(chat);
    if (chat) {
      this.updateLastVisit(chat._id);
    }
  }

  getUserData() {
    return this.userDataSubject.value;
  }

  handleMessage(messageData: EmittedMessageData) {
    const currentData = this.userDataSubject.value;
    const currentActiveChat = this.activeChatSubject.value;

    if (currentData && currentData.chatrooms) {
      const chatroomIndex = currentData.chatrooms.findIndex(
        (chat: ChatRoom) => chat._id === messageData.newMessage.chatRoom
      );

      if (chatroomIndex > -1) {
        // Push the incoming message to the chatroom's messages array
        currentData.chatrooms[chatroomIndex].messages.push(
          messageData.newMessage
        );

        currentData.chatrooms[chatroomIndex].lastUpdate = new Date();

        // Update user data
        this.setUserData(currentData);

        if (
          currentActiveChat &&
          currentActiveChat._id === messageData.newMessage.chatRoom
        ) {
          this.setActiveChat(currentActiveChat);
        }
      } else {
        messageData.chatroom.messages = [messageData.newMessage];
        currentData.chatrooms.push(messageData.chatroom);
        this.setUserData(currentData);
      }
    }
  }

  handleContact(contact: User) {
    const currentData = this.userDataSubject.value;
    const activeChat = this.activeChatSubject.value;

    if (
      !currentData.contacts.find(
        (existingContact: User) => existingContact._id === contact._id
      )
    ) {
      currentData.contacts.push(contact);
      this.setUserData(currentData);
    }

    if (activeChat) {
      const contactInActiveChat = activeChat.filteredParticipants.some(
        (participant: ChatRoomParticipant) => {
          return participant.user._id === contact._id;
        }
      );

      if (contactInActiveChat) {
        activeChat.filteredParticipants = activeChat.filteredParticipants.map(
          (participant: ChatRoomParticipant) => {
            if (participant.user._id === contact._id) {
              // participant.user.inUserContacts = true;
              return participant;
            } else {
              return participant;
            }
          }
        );
      }
    }
  }

  inUserContacts(userId: string) {
    const currentData = this.userDataSubject.value;

     const isInContacts = currentData.some((item: User) => item._id === userId);

     return isInContacts;

  }

  handleContactDeletion(deletedContactId: string) {
    const currentData = this.userDataSubject.value;

    // Remove the deleted contact from the contacts array
    currentData.contacts = currentData.contacts.filter(
      (contact: User) => contact._id !== deletedContactId
    );

    this.setUserData(currentData);
  }

  handleNewChat(chatroom: ChatRoom) {
    const currentData = this.userDataSubject.value;
    if (currentData.chatrooms) {
      currentData.chatrooms.push(chatroom);
      this.setUserData(currentData);
      this.setActiveChat(chatroom);
    }
  }

  handleNewAdmin(chatroom: ChatRoom) {
    const currentActiveChat = this.activeChatSubject.value;
    if (currentActiveChat) {
      currentActiveChat.admins = chatroom.admins;
      this.setActiveChat(currentActiveChat);
    }
  }

  removeChat(chatRoomId: string) {
    const currentData = this.userDataSubject.value;
    currentData.chatrooms = currentData.chatrooms.filter((chatroom: any) => {
      return chatroom._id !== chatRoomId;
    });
    this.setUserData(currentData);
    this.setActiveChat(null);
  }

  updateLastVisit(chatRoomId: string) {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    this.http
      .post(
        'http://localhost:3001/update-last-visit',
        { chatRoomId },
        { headers }
      )
      .subscribe({
        next: (response: any) => {
          console.log('Updated last visit: ', response);
          if (response.success) {
            // NEED TO FILL THIS PART IN
          }
        },
      });
  }

  clearAllData() {
    this.userDataSubject.next(null);
    this.activeChatSubject.next(null);
  }
}
