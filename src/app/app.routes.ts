import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'bandeja' },
  { path: 'bandeja', title: 'Support Flow — Bandeja', loadComponent: () => import('./features/inbox/inbox.component').then(m => m.InboxComponent) },
  { path: 'contactos', title: 'Support Flow — Contactos', loadComponent: () => import('./features/contacts/contacts.component').then(m => m.ContactsComponent) },
  { path: '**', redirectTo: 'bandeja' },
];
