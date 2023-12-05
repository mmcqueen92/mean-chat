import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3001';
  constructor(private http: HttpClient, private tokenService: TokenService) {}

  public updateLastVisit(chatRoomId: string): Observable<any> {
    const url = `${this.apiUrl}/update-last-visit`;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.http.post(url, { chatRoomId }, { headers });
  }

  public sendMessage(messageData: { text: string; chatRoomId: string }) {
    const url = `${this.apiUrl}/new-message`;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.http.post(url, { messageData }, { headers });
  }
}
