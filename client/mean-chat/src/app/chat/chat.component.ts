import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { TokenService } from '../token.service';
import { ApiService } from '../api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../interfaces/user.interface';
import { Message } from '../interfaces/message.interface';
import { ChatRoom } from '../interfaces/chatroom.interface';
import { ChatRoomParticipant } from '../interfaces/chatroom-participant.interface';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  messageText: string = '';
  messages: Message[] = [];
  participants: ChatRoomParticipant[] = [];
  activeChat!: ChatRoom;
  currentUser!: User;
  promoteMembers: boolean = false;
  chatControls: boolean = false;

  constructor(
    private dataService: DataService,
    private http: HttpClient,
    private tokenService: TokenService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.dataService.activeChat$.subscribe((activeChat) => {
      this.activeChat = activeChat;
      if (activeChat) {
        this.messages = activeChat.messages.map((message: Message) => ({
          ...message,
          sender:
            typeof message.sender === 'string'
              ? this.getSenderData(message.sender)
              : message.sender,
        }));

        this.messages.reverse();

        this.participants = activeChat.participants.filter(
          (participant: ChatRoomParticipant) => {
            return participant.user._id !== this.dataService.getUserData()._id;
          }
        );
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

  getSenderData(senderId: string) {
    const sender = this.activeChat.participants.find(
      (participant: ChatRoomParticipant) => {
        return participant.user._id === senderId;
      }
    );

    if (sender) {
      return { _id: sender.user._id, name: sender.user.name };
    }

    return null; // if sender data is not found
  }

  inUserContacts(userId: string): boolean {
    const currentUser = this.currentUser;

    if (!currentUser || !currentUser.contacts) {
      return false;
    }

    return currentUser.contacts.some((contact) =>
      typeof contact === 'string' ? contact === userId : contact._id === userId
    );
  }

  inActiveChatAdmins(userId: string): boolean {
    const activeChat = this.activeChat;

    if (!activeChat || !activeChat.admins) {
      return false;
    }

    if (Array.isArray(activeChat.admins)) {
      return activeChat.admins.some((admin) =>
        typeof admin === 'string' ? admin === userId : admin._id === userId
      );
    }

    return false;
  }

  sentByUser(message: Message): boolean {
    const currentUser = this.currentUser;

    if (!currentUser || !message || !message.sender) {
      return false;
    }

    const messageSender = message.sender;

    if (typeof messageSender === 'object' && '_id' in messageSender) {
      return messageSender._id === currentUser._id;
    }

    if (typeof messageSender === 'string') {
      return messageSender === currentUser._id;
    }

    return false;
  }

  messagePopulated(message: Message): boolean {
    return typeof message.sender === 'string' ? false : true;
  }

  getMessageSenderName(sender: string | User): string {
    return typeof sender === 'object' ? sender.name : sender;
  }

  sendMessage() {
    const messageData = {
      text: this.messageText,
      chatRoomId: this.activeChat._id,
    };

    this.apiService.sendMessage(messageData)
      .subscribe((response) => {
        this.messageText = '';
      });
  }

  addToContacts(contactEmail: string) {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const newContactEmail = contactEmail;

    this.http
      .post<User>(
        'http://localhost:3001/add-contact',
        { newContactEmail },
        { headers }
      )
      .subscribe({
        next: (response: User) => {
          this.dataService.handleContact(response);
          // this.participants.forEach((participant) => {
          //   if (participant.user.email === contactEmail) {
          //     participant.user.inUserContacts = true;
          //   }
          // });
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
      .post<{ message: string; chatRoomId: string }>(
        'http://localhost:3001/delete-chatroom',
        { chatRoomId },
        { headers }
      )
      .subscribe({
        next: (response: { message: string; chatRoomId: string }) => {
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
      .post<ChatRoom>(
        'http://localhost:3001/promote-to-admin',
        { chatRoomId, chatMemberId },
        { headers }
      )
      .subscribe({
        next: (response: ChatRoom) => {
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
      .post<{ message: string; chatRoomId: string }>(
        'http://localhost:3001/leave-chat',
        { chatRoomId },
        { headers }
      )
      .subscribe({
        next: (response: { message: string; chatRoomId: string }) => {
          this.dataService.removeChat(response.chatRoomId);
        },
        error: (error) => {
          console.error('error: ', error);
        },
      });
  }
}
