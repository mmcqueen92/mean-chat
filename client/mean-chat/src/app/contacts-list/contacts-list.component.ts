import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../data.service';
import { TokenService } from '../token.service';
import { User } from '../interfaces/user.interface';
import { ChatRoom } from '../interfaces/chatroom.interface';
import { ChatRoomParticipant } from '../interfaces/chatroom-participant.interface';

@Component({
  selector: 'app-contacts-list',
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.css'],
})
export class ContactsListComponent implements OnInit {
  contacts!: User[];

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.dataService.userData$.subscribe((data) => {
      this.contacts = data?.contacts;
    });
  }

  findChat(contact: User) {
    const user = this.dataService.getUserData();
    const currentUserID = user._id;
    const selectedContactID = contact._id;

    const chat = user.chatrooms.find((chatRoom: ChatRoom) => {
      let participantIds: string[] = [];
      const participants = chatRoom.participants;

      // loop through participants, add the ._id of each participant to the participantsIds array
      participants.forEach((participant: ChatRoomParticipant) => {
        participantIds.push(participant.user._id);
      });

      return (
        participantIds.length === 2 &&
        participantIds.includes(currentUserID) &&
        participantIds.includes(selectedContactID)
      );
    });

    return chat ? chat : false;
  }

  openChat(contact: User): void {
    const chat = this.findChat(contact);

    if (chat) {
      this.dataService.setActiveChat(chat);
    } else {
      const user = this.dataService.getUserData();
      const token = this.tokenService.getToken();
      const headers = new HttpHeaders().set('Authorization', `${token}`);
      const participants = [{ user: user._id }, { user: contact._id }];
      const body = {
        participants,
      };

      this.http
        .post<ChatRoom>('http://localhost:3001/create-chat', body, { headers })
        .subscribe({
          next: (response: ChatRoom) => {
            this.dataService.handleNewChat(response);
            console.log('RESPONSE: ', response);
          },
          error: (error) => {
            console.error('Chat creation error: ', error);
          },
        });
    }
  }

  deleteContact(contactId: string): void {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    this.http
      .post<{ message: string; deletedContactId: string }>(
        'http://localhost:3001/delete-contact',
        { contactId },
        { headers }
      )
      .subscribe({
        next: (response: { message: string; deletedContactId: string }) => {
          this.dataService.handleContactDeletion(response.deletedContactId);
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
  }
}
