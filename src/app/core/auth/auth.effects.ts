import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthSessionService } from './auth-session.service';
import { loginFailed, loginRequested, loginSucceeded, logoutCompleted, logoutRequested, restoreSession, restoreSessionFailed, restoreSessionSucceeded, sessionExpired } from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions = inject(Actions);
  private readonly api = inject(AuthSessionService);
  private readonly router = inject(Router);

  restore$ = createEffect(() => this.actions.pipe(
    ofType(restoreSession),
    switchMap(() => this.api.currentUser().pipe(
      map(user => restoreSessionSucceeded({ user })),
      catchError(() => of(restoreSessionFailed())),
    )),
  ));

  login$ = createEffect(() => this.actions.pipe(
    ofType(loginRequested),
    switchMap(({ email, password, returnUrl }) => this.api.login(email, password).pipe(
      map(user => loginSucceeded({ user, returnUrl })),
      catchError(cause => {
        const status = cause instanceof HttpErrorResponse ? cause.status : 0;
        return of(loginFailed({ message: status === 401 ? 'El correo o la contraseña no son correctos.' : status === 0 ? 'No pudimos conectar con Support Flow. Comprueba que el backend esté iniciado.' : 'No fue posible iniciar sesión en este momento. Inténtalo de nuevo.' }));
      }),
    )),
  ));

  navigateAfterLogin$ = createEffect(() => this.actions.pipe(
    ofType(loginSucceeded),
    tap(({ returnUrl }) => {
      const safe = returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/dashboard';
      void this.router.navigateByUrl(safe);
    }),
  ), { dispatch: false });

  logout$ = createEffect(() => this.actions.pipe(
    ofType(logoutRequested),
    switchMap(() => this.api.logout().pipe(catchError(() => of(null)), map(() => logoutCompleted()))),
  ));

  redirectExpired$ = createEffect(() => this.actions.pipe(
    ofType(sessionExpired),
    tap(() => void this.router.navigateByUrl('/login')),
  ), { dispatch: false });

  clearExpiredCookie$ = createEffect(() => this.actions.pipe(
    ofType(sessionExpired),
    switchMap(() => this.api.logout().pipe(catchError(() => of(null)), map(() => logoutCompleted()))),
  ));
}
