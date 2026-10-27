import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'knowledge-base/documentos', title: 'Support Flow — Documentos', loadComponent: () => import('./features/knowledge-base/documents.component').then(m => m.DocumentsComponent) },
  { path: 'settings/canales', title: 'Support Flow — Conexiones', loadComponent: () => import('./features/connections/connections.component').then(m => m.ConnectionsComponent) },
  { path: 'cambiar-equipo', title: 'Support Flow — Cambiar equipo', loadComponent: () => import('./features/admin/switch-team.component').then(m => m.SwitchTeamComponent) },
  { path: 'admin/equipos', title: 'Support Flow — Equipos', loadComponent: () => import('./features/admin/admin-teams.component').then(m => m.AdminTeamsComponent) },
  { path: 'admin/usuarios', title: 'Support Flow — Usuarios', loadComponent: () => import('./features/admin/admin-users.component').then(m => m.AdminUsersComponent) },
  { path: 'ai-agent/:id/activar', title: 'Support Flow — Activar agente', loadComponent: () => import('./features/ai-agent/agent-activation.component').then(m => m.AgentActivationComponent) },
  { path: 'team/invitar', title: 'Support Flow — Invitar integrante', loadComponent: () => import('./features/team/team-invitation.component').then(m => m.TeamInvitationComponent) },
  { path: 'settings', title: 'Support Flow — Settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
  { path: 'knowledge-base/nuevo', title: 'Support Flow — Nuevo artículo', loadComponent: () => import('./features/knowledge-base/knowledge-editor.component').then(m => m.KnowledgeEditorComponent) },
  { path: 'knowledge-base/:id/editar', title: 'Support Flow — Editar artículo', loadComponent: () => import('./features/knowledge-base/knowledge-editor.component').then(m => m.KnowledgeEditorComponent) },
  { path: 'knowledge-base', title: 'Support Flow — Knowledge Base', loadComponent: () => import('./features/knowledge-base/knowledge-base.component').then(m => m.KnowledgeBaseComponent) },
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
