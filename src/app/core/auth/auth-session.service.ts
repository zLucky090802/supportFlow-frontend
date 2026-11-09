import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { ApiEnvelope, AuthUser } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly http = inject(HttpClient);

  constructor() {
    try { sessionStorage.removeItem('supportflow.access-token'); } catch { /* Browser storage may be disabled. */ }
  }

  login(email: string, password: string): Observable<AuthUser> {
    const body = new HttpParams().set('username', email.trim()).set('password', password);
    return this.http.post('/auth/login', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: true,
    }).pipe(switchMap(() => this.currentUser()));
  }

  currentUser(): Observable<AuthUser> {
    return this.http.get<ApiEnvelope<AuthUser>>('/auth/me', { withCredentials: true }).pipe(
      map(response => {
        if (!response.success || !response.data?.id) throw new Error('La API devolvió una cuenta no válida.');
        return response.data;
      }),
    );
  }

  logout(): Observable<unknown> {
    return this.http.post('/auth/logout', {}, { withCredentials: true });
  }
}
