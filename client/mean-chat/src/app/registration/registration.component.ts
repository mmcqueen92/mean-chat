import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import required modules for forms
import { Router } from '@angular/router'; // Import Router for navigation

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {
  registrationForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router) {
    this.registrationForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }


  onSubmit() {
    if (this.registrationForm.invalid) {
      return;
    }

    const userData = this.registrationForm.value;
    // send userData to backend
   
    // navigate to the login page
    this.router.navigate(['/login']);
  }
}
