import { Component } from '@angular/core';


@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css'],
})
export class ContactsComponent {
  newContactForm: boolean = false;

  toggleNewContactForm = () => {
    if(this.newContactForm) {
      this.newContactForm = false;
    } else {
      this.newContactForm = true;
    }
  }

}
