import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user.interface';
import { ChatRoom } from '../../interfaces/chatroom.interface';
import { ChatRoomParticipant } from '../../interfaces/chatroom-participant.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contacts-list',
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.css'],
})
export class ContactsListComponent implements OnInit, OnDestroy {
  contacts!: User[];
  private userDataSubscription: Subscription | null = null;

  constructor(
    private dataService: DataService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.userDataSubscription = this.dataService.userData$.subscribe((data) => {
      this.contacts = data?.contacts;
    });
  }

  ngOnDestroy(): void {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
  }

  findChat(contact: User): ChatRoom {
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

    return chat;
  }

  openChat(contact: User): void {
    const chat = this.findChat(contact);

    if (chat) {
      this.dataService.setActiveChat(chat);
    } else {
      this.apiService.createChat(contact._id).subscribe({
        next: (response: ChatRoom) => {
          this.dataService.handleNewChat(response);
        },
        error: (error) => {
          console.error('Chat creation error: ', error);
        },
      });
    }
  }

  deleteContact(contactId: string): void {
    this.apiService.deleteContact(contactId).subscribe({
      next: (response: { message: string; deletedContactId: string }) => {
        this.dataService.handleContactDeletion(response.deletedContactId);
      },
      error: (error) => {
        console.error('Error: ', error);
      },
    });
  }
}
