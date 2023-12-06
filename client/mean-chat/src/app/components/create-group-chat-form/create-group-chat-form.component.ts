import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ApiService } from '../../services/api.service';
import { ChatRoom } from '../../interfaces/chatroom.interface';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-create-group-chat-form',
  templateUrl: './create-group-chat-form.component.html',
  styleUrls: ['./create-group-chat-form.component.css'],
})
export class CreateGroupChatFormComponent implements OnInit {
  @Input() toggleGroupChatForm!: () => void;
  chatrooms: ChatRoom[] = [];
  contacts: User[] = [];
  filteredContacts: User[] = [];
  newGroupParticipants: string[] = [];
  newGroupName: string = '';

  constructor(
    private dataService: DataService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.dataService.userData$.subscribe((userData) => {
      if (userData) {
        this.chatrooms = userData.chatrooms;
        this.contacts = userData.contacts;
        this.filteredContacts = userData.contacts;
      } else {
        this.chatrooms = [];
      }
    });
  }

  onSearchQueryChanged(searchQuery: string): void {
    this.filteredContacts = this.contacts.filter((contact) => {
      // check if name contains searchQuery as a substring
      return contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }

  addToGroupChat(id: string): void {
    this.newGroupParticipants.push(id);
  }

  removeFromGroupChat(id: string): void {
    this.newGroupParticipants = this.newGroupParticipants.filter(
      (el) => el !== id
    );
  }

  createGroupChat(): void {
    const participantIds = this.newGroupParticipants;
    const chatName = this.newGroupName;

    const participants = participantIds.map((participantId) => {
      return { user: participantId };
    });

    this.apiService.createGroupChat(participants, chatName).subscribe({
      next: (response: ChatRoom) => {
        this.dataService.handleNewChat(response);
        this.toggleGroupChatForm();
      },
      error: (error) => {
        console.error('Group chat creation error: ', error);
      },
    });
  }
}
