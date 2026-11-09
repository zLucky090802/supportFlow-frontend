import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { sessionExpired } from './auth.actions';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const store = inject(Store);
  const credentialed = request.url.startsWith('/') && !request.url.startsWith('//')
    ? request.clone({ withCredentials: true })
    : request;
  return next(credentialed).pipe(catchError(error => {
    if (error.status === 401 && !request.url.endsWith('/auth/login') && !request.url.endsWith('/auth/logout')) {
      store.dispatch(sessionExpired());
    }
    return throwError(() => error);
  }));
};
