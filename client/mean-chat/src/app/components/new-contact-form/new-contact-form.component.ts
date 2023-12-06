import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DataService } from '../../services/data.service';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-contact-form',
  templateUrl: './new-contact-form.component.html',
  styleUrls: ['./new-contact-form.component.css'],
})
export class NewContactFormComponent implements OnInit {
  @Input() toggleNewContactForm!: () => void;
  foundUsersList: User[] = [];
  searchForm!: FormGroup;
  currentUser!: User;
  private userDataSubscription: Subscription | null = null;

  constructor(
    private dataService: DataService,
    private apiService: ApiService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      query: [''],
    });

    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.searchUsers(value.query);
      });

    this.userDataSubscription = this.dataService.userData$.subscribe(
      (userData) => {
        if (userData) {
          this.currentUser = userData;
        }
      }
    );
  }

  searchUsers(query: string): void {
    const userData = this.dataService.getUserData();

    this.apiService.searchUsers(query).subscribe({
      next: (response: User[]) => {
        this.foundUsersList = response;
        this.foundUsersList = this.foundUsersList.filter((user: User) => {
          return (
            user._id !== userData._id &&
            !userData.contacts.some((contact: User) => contact._id === user._id)
          );
        });
      },
    });
  }

  addNewContact(newContactEmail: string): void {
    this.apiService.addNewContact(newContactEmail).subscribe({
      next: (response: User) => {
        this.dataService.handleContact(response);
        this.toggleNewContactForm();
      },
      error: (error) => {
        console.error('Error: ', error);
      },
    });
  }

  userInContacts(user: User): boolean {
    if (this.currentUser.contacts) {
      return this.currentUser.contacts.some((contact) => {
        if (typeof contact === 'string') {
          return contact === user._id;
        } else {
          return contact._id === user._id;
        }
      });
    }
    return false;
  }

  userIsCurrentUser(user: User) {
    if (this.currentUser) {
      return user._id === this.currentUser._id;
    }
    return false;
  }
}
