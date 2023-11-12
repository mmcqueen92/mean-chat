import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../token.service';
import { DataService } from '../data.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css'],
})
export class ContactsComponent implements OnInit {
  newContactEmail: string = ''; // store email entered in form
  contacts: any;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    console.log('Contacts component initialized');
    this.dataService.userData$.subscribe((data) => {
      this.contacts = data?.contacts;
    });
  }

  openChat(contact: any): void {
    const user = this.dataService.getUserData();
    const currentUserID = user._id;
    const selectedContactID = contact._id;

    const chatExists = user.chatrooms.find((chatRoom: any) => {
      let participantIds: any[] = [];
      const participants = chatRoom.participants;

      // loop through participants, add the ._id of each participant to the participantsIds array
      participants.forEach((participant: any) => {
        participantIds.push(participant._id);
      });

      return (
        participantIds.length === 2 &&
        participantIds.includes(currentUserID) &&
        participantIds.includes(selectedContactID)
      );
    });
    if (chatExists) {
      this.dataService.setActiveChat(chatExists);
      console.log('CHATEXISTS:', chatExists);
    } else {
      const token = this.tokenService.getToken();
      const headers = new HttpHeaders().set('Authorization', `${token}`);
      const body = {
        participants: [currentUserID, selectedContactID],
      };

      this.http
        .post('http://localhost:3001/create-chat', body, { headers })
        .subscribe({
          next: (response: any) => {
            console.log('Chat created?', response);
            this.dataService.handleNewChat(response);
          },
          error: (error) => {
            console.error('Chat creation error: ', error);
          },
        });
    }
  }

  addNewContact() {
    const newContactEmail = this.newContactEmail;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    this.http
      .post(
        'http://localhost:3001/add-contact',
        { newContactEmail },
        { headers }
      )
      .subscribe({
        next: (response: any) => {
          console.log('Contact added?', response);
          this.dataService.handleContact(response.newContact);
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });

    // clear input field
    this.newContactEmail = '';
  }

  deleteContact(contactId: string): void {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    this.http
      .post('http://localhost:3001/delete-contact', { contactId }, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Contact deleted?', response);
          this.dataService.handleContactDeletion(response.deletedContactId);
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
  }
}
