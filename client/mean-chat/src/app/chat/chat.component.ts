import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { TokenService } from '../token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  messageText: string = '';
  messages: any[] = [];
  participants: any[] = [];
  activeChat: any;
  currentUser: any = {};
  promoteMembers: boolean = false;
  chatControls: boolean = false;

  constructor(
    private dataService: DataService,
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  getSenderData(senderId: string) {
    const sender = this.activeChat.participants.find((participant: any) => {
      return participant.user._id === senderId;
    });

    if (sender) {
      return { _id: sender._id, name: sender.user.name };
    }

    return null; // if sender data is not found
  }

  ngOnInit(): void {
    this.dataService.activeChat$.subscribe((activeChat) => {
      this.activeChat = activeChat;
      if (activeChat) {
        this.messages = activeChat.messages.map((message: any) => ({
          ...message,
          sender: this.getSenderData(message.sender),
        }));
        this.messages.reverse();

        this.participants = activeChat.participants.filter(
          (participant: any) => {
            return participant.user._id !== this.dataService.getUserData()._id;
          }
        );

        if (this.participants && this.currentUser) {
          this.participants = this.participants.map((participant: any) => {
            participant.user.inUserContacts = this.currentUser.contacts.some(
              (contact: any) => contact._id === participant.user._id
            );
            return participant;
          });
        }
        console.log("ACTIVE CHAT: ", this.activeChat)
      } else {
        this.messages = [];
        this.participants = [];
      }
    });

    this.dataService.userData$.subscribe((userData) => {
      if (userData) {
        this.currentUser = userData;
      }
    });
  }

  sendMessage() {
    const messageData = {
      text: this.messageText,
      chatRoom: this.activeChat._id,
      sender: this.currentUser._id,
      token: this.tokenService.getToken(),
    };

    this.http
      .post('http://localhost:3001/messages/new', messageData)
      .subscribe((response) => {
        this.messageText = '';
      });
  }

  addToContacts(contactEmail: string) {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const newContactEmail = contactEmail;

    this.http
      .post(
        'http://localhost:3001/add-contact',
        { newContactEmail },
        { headers }
      )
      .subscribe({
        next: (response: any) => {
          this.dataService.handleContact(response.newContact);
          this.participants.forEach((participant) => {
            if (participant.user.email === contactEmail) {
              participant.user.inUserContacts = true;
            }
          });
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
  }

  deleteChatRoom(chatRoomId: string) {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    this.http
      .post(
        'http://localhost:3001/delete-chatroom',
        { chatRoomId },
        { headers }
      )
      .subscribe({
        next: (response: any) => {
          this.dataService.removeChat(response.chatRoomId);
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
  }

  toggleChatControls() {
    this.chatControls
      ? (this.chatControls = false)
      : (this.chatControls = true);
  }

  togglePromoteMembers() {
    this.promoteMembers
      ? (this.promoteMembers = false)
      : (this.promoteMembers = true);
  }

  promoteToAdmin(chatMemberId: string) {
    const chatRoomId = this.activeChat._id;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    this.http
      .post(
        'http://localhost:3001/promote-to-admin',
        { chatRoomId, chatMemberId },
        { headers }
      )
      .subscribe({
        next: (response: any) => {
          this.dataService.handleNewAdmin(response);
          this.promoteMembers = false;
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
  }

  leaveChat() {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const chatRoomId = this.activeChat._id;

    this.http
      .post('http://localhost:3001/leave-chat', { chatRoomId }, { headers })
      .subscribe({
        next: (response: any) => {
          this.dataService.removeChat(response.chatRoomId);
        },
        error: (error) => {
          console.error('error: ', error);
        },
      });
  }
}
