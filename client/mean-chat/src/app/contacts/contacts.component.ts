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

  constructor(private http: HttpClient, private tokenService: TokenService, private dataService: DataService) {}

  ngOnInit(): void {
    console.log("Contacts component initialized")
    this.dataService.userData$.subscribe((data) => {
      this.contacts = data?.contacts;
    });
  }

  onSubmit() {
    const newContactEmail = this.newContactEmail;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    this.http
      .post(
        'http://localhost:3001/add-contact',
        newContactEmail,
        { headers }
      )
      .subscribe({
        next: (response: any) => {
          console.log('Contact added?', response);
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });

    // clear input field
    this.newContactEmail = '';
  }
}
