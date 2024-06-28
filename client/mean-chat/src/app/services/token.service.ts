import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private tokenKey = 'mean-chat-token';

  setToken(token: string): void {
    console.log("SET TOKEN")
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    console.log('GET TOKEN');
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    console.log('CLEAR TOKEN');
    localStorage.removeItem(this.tokenKey);
  }
}
