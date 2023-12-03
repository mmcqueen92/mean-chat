import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TokenService } from '../token.service';
import { DataService } from '../data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-new-contact-form',
  templateUrl: './new-contact-form.component.html',
  styleUrls: ['./new-contact-form.component.css'],
})
export class NewContactFormComponent implements OnInit {
  @Input() toggleNewContactForm!: () => void;
  foundUsersList: any[] = [];
  searchForm!: FormGroup;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private dataService: DataService,
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
  }

  searchUsers(query: string): void {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    this.http
      .post('http://localhost:3001/search-users', { query }, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('SEARCH USERS RESPONSE: ', response);
          this.foundUsersList = response;
        },
      });
  }

  addNewContact(newContactEmail: string): void {
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
          this.dataService.handleContact(response.newContact);
          this.toggleNewContactForm();
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
  }
}
