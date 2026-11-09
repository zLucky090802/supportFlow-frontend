import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { ApiEnvelope, AuthUser, LoginResponse } from './auth.models';

const TOKEN_KEY = 'supportflow.access-token';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly http = inject(HttpClient);
  private readonly current = signal<AuthUser | null>(null);
  readonly user = this.current.asReadonly();
  readonly isAuthenticated = computed(() => !!this.current());

  get token(): string | null {
    try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
  }

  login(email: string, password: string): Observable<AuthUser> {
    const body = new HttpParams().set('username', email.trim()).set('password', password);
    return this.http.post<LoginResponse>('/auth/login', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).pipe(
      tap(result => {
        if (result.token_type !== 'bearer' || !result.access_token) throw new Error('La API devolvió una sesión no válida.');
        try { sessionStorage.setItem(TOKEN_KEY, result.access_token); }
        catch { throw new Error('No se pudo iniciar una sesión segura en este navegador.'); }
      }),
      switchMap(() => this.loadCurrentUser()),
      catchError(error => { this.logout(); return throwError(() => error); }),
    );
  }

  ensureUser(): Observable<AuthUser | null> {
    if (this.current()) return of(this.current());
    if (!this.token) return of(null);
    return this.loadCurrentUser().pipe(catchError(() => { this.logout(); return of(null); }));
  }

  loadCurrentUser(): Observable<AuthUser> {
    return this.http.get<ApiEnvelope<AuthUser>>('/auth/me').pipe(
      map(response => {
        if (!response.success || !response.data?.id) throw new Error('La API devolvió una cuenta no válida.');
        return response.data;
      }),
      tap(user => this.current.set(user)),
    );
  }

  logout(): void {
    this.current.set(null);
    try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* Storage can be unavailable in restricted browsers. */ }
  }
}
