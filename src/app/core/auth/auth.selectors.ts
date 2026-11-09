import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectCurrentUser = createSelector(selectAuthState, state => state.user);
export const selectAuthInitialized = createSelector(selectAuthState, state => state.initialized);
export const selectAuthLoading = createSelector(selectAuthState, state => state.loading);
export const selectAuthError = createSelector(selectAuthState, state => state.error);
export const selectIsAuthenticated = createSelector(selectCurrentUser, Boolean);
