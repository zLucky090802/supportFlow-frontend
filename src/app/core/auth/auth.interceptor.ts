import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthSessionService } from './auth-session.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthSessionService);
  const router = inject(Router);
  const token = session.token;
  const isApiRequest = request.url.startsWith('/') && !request.url.startsWith('//');
  const secured = token && isApiRequest ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(secured).pipe(catchError(error => {
    if (error.status === 401 && !request.url.endsWith('/auth/login')) {
      session.logout();
      void router.navigateByUrl('/login');
    }
    return throwError(() => error);
  }));
};
