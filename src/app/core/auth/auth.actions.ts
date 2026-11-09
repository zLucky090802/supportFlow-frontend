import { createAction, props } from '@ngrx/store';
import { AuthUser } from './auth.models';

export const restoreSession = createAction('[Auth] Restore session');
export const restoreSessionSucceeded = createAction('[Auth] Restore session succeeded', props<{ user: AuthUser }>());
export const restoreSessionFailed = createAction('[Auth] Restore session failed');
export const loginRequested = createAction('[Auth] Login requested', props<{ email: string; password: string; returnUrl: string }>());
export const loginSucceeded = createAction('[Auth] Login succeeded', props<{ user: AuthUser; returnUrl: string }>());
export const loginFailed = createAction('[Auth] Login failed', props<{ message: string }>());
export const logoutRequested = createAction('[Auth] Logout requested');
export const logoutCompleted = createAction('[Auth] Logout completed');
export const sessionExpired = createAction('[Auth] Session expired');
