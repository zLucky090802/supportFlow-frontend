import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminDemoStore, AdminUser, normalizeAdmin } from './admin-demo.store';
import { AdminShellComponent } from './admin-shell.component';
type UserAction = 'role' | 'move' | 'status';
@Component({selector:'app-admin-users', imports:[AdminShellComponent, FormsModule], templateUrl:'./admin-users.component.html', styleUrls:['./admin-shared.scss','./admin-users.component.scss'], changeDetection:ChangeDetectionStrategy.OnPush})
export class AdminUsersComponent {
  readonly store = inject(AdminDemoStore);
  readonly query = signal(''); readonly team = signal(''); readonly status = signal(''); readonly role = signal(''); readonly selectedId = signal(1);
  readonly feedback = signal(''); readonly action = signal<UserAction>('role'); readonly actionUserId = signal<number | null>(null); readonly actionValue = signal('');
  readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('actionDialog');
  readonly filtered = computed(() => this.store.users().filter(user => (!this.query().trim() || normalizeAdmin(user.name+' '+user.email).includes(normalizeAdmin(this.query()))) && (!this.team() || user.team === this.team()) && (!this.status() || user.status === this.status()) && (!this.role() || user.role === this.role())));
  readonly selected = computed<AdminUser | null>(() => this.filtered().find(user => user.id === this.selectedId()) ?? this.filtered()[0] ?? null);
  readonly actionUser = computed(() => this.store.users().find(user => user.id === this.actionUserId()) ?? null);
  readonly destinationTeams = computed(() => this.store.teams().filter(team => team.id !== this.actionUser()?.team));
  readonly blocked = computed(() => { const user=this.actionUser(); return !user || !this.store.canManage(user) || (this.action()==='move' && (user.chats>0 || !this.actionValue())) || (this.action()==='status' && user.status==='Activo' && user.chats>0); });
  readonly actionTitle = computed(() => this.action()==='role'?'Cambiar rol':this.action()==='move'?'Mover a otro equipo':this.actionUser()?.status==='Suspendido'?'Reactivar acceso':'Suspender acceso');
  initials(user: AdminUser): string { return user.name.split(' ').map(part=>part[0]).slice(0,2).join(''); }
  clearFilters(): void { this.query.set('');this.team.set('');this.status.set('');this.role.set(''); }
  openAction(action: UserAction): void {
    const user=this.selected(); if(!user || !this.store.canManage(user)) return;
    this.actionUserId.set(user.id);this.action.set(action);this.actionValue.set(action==='role'?user.role:this.destinationTeams()[0]?.id??'');
    this.dialog().nativeElement.showModal();
  }
  confirm(): void {
    const user=this.actionUser();if(!user || this.blocked()) return;
    if(this.store.changeUser(user.id,this.action(),this.actionValue())) { this.feedback.set('Cambio simulado para '+user.name+'. No se modificó el backend.');this.dialog().nativeElement.close(); }
  }
}
