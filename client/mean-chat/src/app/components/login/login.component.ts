import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter a valid email and password';
      return;
    }

    const userData = this.loginForm.value;

    // send userData to backend
    this.apiService.login(userData).subscribe({
      next: (response: { token: string }) => {
        // successful response should return token
        const token = response.token;

        // save token in localstorage
        localStorage.setItem('mean-chat-token', token);

        // navigate to user home page
        this.router.navigate(['/home']);
      },
      error: (error) => {
        // Handle authentication errors here
        console.error('Authentication error', error);
        this.errorMessage = 'Authentication Error';
        // You can display an error message to the user
      },
    });
  }
}
