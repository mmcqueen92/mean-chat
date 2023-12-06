import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService
  ) {
    this.registrationForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.registrationForm.invalid) {
      this.errorMessage =
        'Please enter a valid username, email, and password (password must be at least 6 characters)';
      return;
    }

    const userData = this.registrationForm.value;

    this.apiService.register(userData)
      .subscribe({
        next: (response: { token: string }) => {
          const token = response.token;

          localStorage.setItem('mean-chat-token', token);

          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Registration error', error);
        },
      });
  }
}
