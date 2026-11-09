import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthSessionService } from './auth-session.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(AuthSessionService);
  const router = inject(Router);
  return session.ensureUser().pipe(map(user => user ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })));
};
