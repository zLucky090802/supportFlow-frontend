import { Injectable, computed, signal } from '@angular/core';
export type AdminRole = 'Agente' | 'Administrador de equipo' | 'Administrador global';
export type AdminStatus = 'Activo' | 'Suspendido' | 'Pendiente';
export interface AdminTeam { id: string; name: string; description: string; initials: string; }
export interface AdminUser { id: number; name: string; email: string; team: string; role: AdminRole; status: AdminStatus; chats: number; }
export const normalizeAdmin = (value: string): string => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
/** Presentation state only; these demo rules do not provide authorization. */
@Injectable({ providedIn: 'root' })
export class AdminDemoStore {
  readonly teams = signal<AdminTeam[]>([
    { id: 'support', name: 'Soporte principal', description: 'Consultas generales y acompañamiento a clientes.', initials: 'SP' },
    { id: 'sales', name: 'Comercial', description: 'Nuevos clientes, productos y oportunidades.', initials: 'CO' },
    { id: 'success', name: 'Customer Success', description: 'Seguimiento y experiencia después de la compra.', initials: 'CS' },
  ]);
  readonly users = signal<AdminUser[]>([
    { id: 1, name: 'Camila Torres', email: 'camila@supportflow.demo', team: 'support', role: 'Agente', status: 'Activo', chats: 5 },
    { id: 2, name: 'Daniel Espitia', email: 'daniel@supportflow.demo', team: 'support', role: 'Administrador global', status: 'Activo', chats: 0 },
    { id: 3, name: 'Santiago Ruiz', email: 'santiago@supportflow.demo', team: 'support', role: 'Agente', status: 'Activo', chats: 3 },
    { id: 4, name: 'Valentina Rojas', email: 'valentina@supportflow.demo', team: 'sales', role: 'Administrador de equipo', status: 'Activo', chats: 0 },
    { id: 5, name: 'Andrés López', email: 'andres@supportflow.demo', team: 'sales', role: 'Agente', status: 'Pendiente', chats: 0 },
    { id: 6, name: 'Laura Martínez', email: 'laura@supportflow.demo', team: 'success', role: 'Agente', status: 'Suspendido', chats: 0 },
  ]);
  readonly activeTeamId = signal('support');
  readonly activeTeam = computed(() => this.teams().find(team => team.id === this.activeTeamId())!);
  readonly accessibleTeams = computed(() => this.teams().filter(team => ['support', 'sales', 'success'].includes(team.id)));
  private nextId = 1;
  teamName(id: string): string { return this.teams().find(team => team.id === id)?.name ?? ''; }
  memberCount(id: string): number { return this.users().filter(user => user.team === id).length; }
  canManage(user: AdminUser): boolean { return user.id !== 2 && user.role !== 'Administrador global' && user.status !== 'Pendiente'; }
  changeUser(id: number, action: 'role' | 'move' | 'status', value = ''): boolean {
    const user = this.users().find(item => item.id === id);
    if (!user || !this.canManage(user)) return false;
    let update: Partial<AdminUser>;
    if (action === 'role') {
      if (value !== 'Agente' && value !== 'Administrador de equipo') return false;
      update = { role: value };
    } else if (action === 'move') {
      if (user.chats || value === user.team || !this.teams().some(team => team.id === value)) return false;
      update = { team: value };
    } else {
      if (user.status === 'Activo' && user.chats) return false;
      update = { status: user.status === 'Suspendido' ? 'Activo' : 'Suspendido' };
    }
    this.users.update(users => users.map(item => item.id === id ? { ...item, ...update } : item));
    return true;
  }
  saveTeam(id: string | null, name: string, description: string): string | null {
    name = name.trim(); description = description.trim();
    if (!name || name.length > 60 || description.length > 180) return 'Escribe un nombre de hasta 60 caracteres y una descripción de hasta 180.';
    if (this.teams().some(team => team.id !== id && normalizeAdmin(team.name) === normalizeAdmin(name))) return 'Ya existe un equipo con este nombre.';
    if (id && !this.teams().some(team => team.id === id)) return 'Este equipo ya no está disponible.';
    if (id) this.teams.update(teams => teams.map(team => team.id === id ? { ...team, name, description } : team));
    else this.teams.update(teams => [...teams, { id: `demo-${this.nextId++}`, name, description, initials: name.slice(0, 2).toUpperCase() }]);
    return null;
  }
  switchTeam(id: string): boolean {
    if (!this.accessibleTeams().some(team => team.id === id)) return false;
    this.activeTeamId.set(id); return true;
  }
}
