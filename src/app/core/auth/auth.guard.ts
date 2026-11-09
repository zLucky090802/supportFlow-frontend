import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, of, switchMap, take } from 'rxjs';
import { restoreSession } from './auth.actions';
import { selectAuthState } from './auth.selectors';

export const authGuard: CanActivateFn = (_route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  return store.select(selectAuthState).pipe(take(1), switchMap(auth => {
    if (auth.initialized) return of(auth.user ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
    store.dispatch(restoreSession());
    return store.select(selectAuthState).pipe(
      filter(current => current.initialized), take(1),
      map(current => current.user ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })),
    );
  }));
};
