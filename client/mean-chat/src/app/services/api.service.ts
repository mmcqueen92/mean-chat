import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { User } from '../interfaces/user.interface';
import { ChatRoom } from '../interfaces/chatroom.interface';

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

  public addNewContact(newContactEmail: string) {
    const url = `${this.apiUrl}/add-contact`;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.http.post<User>(url, { newContactEmail }, { headers });
  }

  public deleteChatRoom(chatRoomId: string) {
    const url = `${this.apiUrl}/delete-chatroom`;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.http.post<{ message: string; chatRoomId: string }>(
      url,
      { chatRoomId },
      { headers }
    );
  }

  public promoteToAdmin(chatMemberId: string, chatRoomId: string) {
    const url = `${this.apiUrl}/promote-to-admin`;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.http.post<ChatRoom>(
      url,
      { chatRoomId, chatMemberId },
      { headers }
    );
  }

  public leaveChat(chatRoomId: string) {
    const url = `${this.apiUrl}/leave-chat`;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.http.post<{ message: string; chatRoomId: string }>(
      url,
      { chatRoomId },
      { headers }
    );
  }

  public createChat(recipientId: string) {
    const url = `${this.apiUrl}/create-chat`;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.http.post<ChatRoom>(url, { recipientId }, { headers });
  }

  public deleteContact(contactId: string) {
    const url = `${this.apiUrl}/delete-contact`;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.http.post<{ message: string; deletedContactId: string }>(
      url,
      { contactId },
      { headers }
    );
  }

  public createGroupChat(participants: { user: string }[], chatName: string) {
    const url = `${this.apiUrl}/create-group-chat`;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.http.post<ChatRoom>(
      url,
      { participants, chatName },
      { headers }
    );
  }

  public login(userData: { email: string; password: string }) {
    const url = `${this.apiUrl}/login`;

    return this.http.post<{ token: string }>(url, userData);
  }

  public searchUsers(query: string) {
    const url = `${this.apiUrl}/search-users`;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.http.post<User[]>(url, { query }, { headers });
  }

  public register(userData: {name: string, email: string, password: string}) {
    const url = `${this.apiUrl}/register`;

    return this.http.post<{ token: string }>(
      url,
      userData
    );
  }
}
