import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router) {this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });}

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const userData = this.loginForm.value;
    // send userData to  backend for authentication
    

    // navigate to the user home page
    this.router.navigate(['/chat']);
  }
}
