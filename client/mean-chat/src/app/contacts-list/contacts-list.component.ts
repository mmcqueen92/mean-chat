import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../data.service';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-contacts-list',
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.css'],
})
export class ContactsListComponent implements OnInit {
  contacts: any;

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

  findChat(contact: any) {
    const user = this.dataService.getUserData();
    const currentUserID = user._id;
    const selectedContactID = contact._id;

    const chat = user.chatrooms.find((chatRoom: any) => {
      let participantIds: any[] = [];
      const participants = chatRoom.participants;

      // loop through participants, add the ._id of each participant to the participantsIds array
      participants.forEach((participant: any) => {
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

  openChat(contact: any): void {
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
        .post('http://localhost:3001/create-chat', body, { headers })
        .subscribe({
          next: (response: any) => {
            this.dataService.handleNewChat(response);
            console.log("RESPONSE: ", response)
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
      .post('http://localhost:3001/delete-contact', { contactId }, { headers })
      .subscribe({
        next: (response: any) => {
          this.dataService.handleContactDeletion(response.deletedContactId);
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
  }
}
