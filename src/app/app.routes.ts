import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'ai-agent', title: 'Support Flow — AI Agent', loadComponent: () => import('./features/ai-agent/agents.component').then(m => m.AgentsComponent) },
  { path: 'ai-agent/:id/configuracion', title: 'Support Flow — Configuración del agente', loadComponent: () => import('./features/ai-agent/new-agent.component').then(m => m.NewAgentComponent) },
  { path: 'ai-agent/nuevo', title: 'Support Flow — Nuevo agente', loadComponent: () => import('./features/ai-agent/new-agent.component').then(m => m.NewAgentComponent) },
  { path: 'team', title: 'Support Flow — Team', loadComponent: () => import('./features/team/team.component').then(m => m.TeamComponent) },
  { path: 'dashboard', title: 'Support Flow — Dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'bandeja', title: 'Support Flow — Bandeja', loadComponent: () => import('./features/inbox/inbox.component').then(m => m.InboxComponent) },
  { path: 'contactos', title: 'Support Flow — Contactos', loadComponent: () => import('./features/contacts/contacts.component').then(m => m.ContactsComponent) },
  { path: '**', redirectTo: 'dashboard' },
];
