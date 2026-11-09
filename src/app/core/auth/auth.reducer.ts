import { createReducer, on } from '@ngrx/store';
import { loginFailed, loginRequested, loginSucceeded, logoutCompleted, logoutRequested, restoreSession, restoreSessionFailed, restoreSessionSucceeded, sessionExpired } from './auth.actions';
import { AuthUser } from './auth.models';

export interface AuthState {
  user: AuthUser | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = { user: null, initialized: false, loading: false, error: null };

export const authReducer = createReducer(
  initialAuthState,
  on(restoreSession, state => ({ ...state, loading: true, error: null })),
  on(restoreSessionSucceeded, (_state, { user }) => ({ user, initialized: true, loading: false, error: null })),
  on(restoreSessionFailed, () => ({ ...initialAuthState, initialized: true })),
  on(loginRequested, state => ({ ...state, loading: true, error: null })),
  on(loginSucceeded, (_state, { user }) => ({ user, initialized: true, loading: false, error: null })),
  on(loginFailed, (state, { message }) => ({ ...state, initialized: true, loading: false, error: message })),
  on(logoutRequested, state => ({ ...state, user: null, loading: true, error: null })),
  on(logoutCompleted, () => ({ ...initialAuthState, initialized: true })),
  on(sessionExpired, () => ({ ...initialAuthState, initialized: true })),
);
