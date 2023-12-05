import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
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

  constructor(private http: HttpClient, private tokenService: TokenService, private apiService: ApiService) {}

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

    console.log("MESSAGE DATA: ", messageData)

    if (currentData && currentData.chatrooms) {
      
      const chatroomIndex = currentData.chatrooms.findIndex(
        (chat: ChatRoom) => chat._id === messageData.chatroom._id
      );
        console.log("CHATROOM INDEX: ", chatroomIndex)
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
          currentActiveChat._id === messageData.chatroom._id
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
    currentData.chatrooms = currentData.chatrooms.filter(
      (chatroom: ChatRoom) => {
        return chatroom._id !== chatRoomId;
      }
    );
    this.setUserData(currentData);
    this.setActiveChat(null);
  }

  updateLastVisit(chatRoomId: string) {

    const currentData = this.userDataSubject.value;

    this.apiService.updateLastVisit(chatRoomId)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            // Find the chatroom with "_id" value equal to chatRoomId in currentData.chatrooms
            const chatroomIndex = currentData.chatrooms.findIndex(
              (chatroom: ChatRoom) => chatroom._id === chatRoomId
            );

            if (chatroomIndex !== -1) {
              // Find the participant element with a "user" value equal to currentData._id

              const participantIndex = currentData.chatrooms[
                chatroomIndex
              ].participants.findIndex(
                (participant: ChatRoomParticipant) =>
                  participant.user._id === currentData._id
              );

              if (participantIndex !== -1) {
                // Update that element's "lastVisit" value with a new Date
                currentData.chatrooms[chatroomIndex].participants[
                  participantIndex
                ].lastVisit = new Date();
                this.setUserData(currentData);
              }
            }
          }
        },
      });
  }

  clearAllData() {
    this.userDataSubject.next(null);
    this.activeChatSubject.next(null);
  }
}
