import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { TEAM_MEMBERS, TEAM_VIEW_COPY, TeamAvailability, TeamGroup, TeamMember, TeamRole, TeamView } from './team.data';

const normalize = (text: string): string => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
@Component({
  selector: 'app-team',
  imports: [FormsModule, AppIconComponent, AppSidebarComponent],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamComponent {
  readonly compact = signal(false);
  readonly members = TEAM_MEMBERS;
  readonly group = signal<TeamGroup>('all');
  readonly query = signal('');
  readonly role = signal<TeamRole | ''>('');
  readonly availability = signal<TeamAvailability | ''>('');
  readonly selectedId = signal(1);
  readonly view = signal<TeamView>('default');
  readonly viewCopy = computed(() => TEAM_VIEW_COPY[this.view()]);
  readonly loadBars = [1, 2, 3, 4, 5];
  readonly memberCount = this.members.filter(m => m.group === 'members').length;
  readonly availableCount = this.members.filter(m => m.state === 'Disponible').length;
  readonly openChats = this.members.reduce((sum, m) => sum + m.chats, 0);
  readonly groups: ReadonlyArray<{ id: TeamGroup; label: string; count: number }> = [
    { id: 'all', label: 'Todos', count: this.members.length },
    { id: 'members', label: 'Integrantes', count: this.memberCount },
    { id: 'invited', label: 'Invitaciones', count: this.members.length - this.memberCount },
  ];
  readonly filteredMembers = computed(() => {
    const query = normalize(this.query().trim());
    return this.members.filter(m =>
      (this.group() === 'all' || m.group === this.group()) &&
      (!query || normalize(m.name + ' ' + m.email).includes(query)) &&
      (!this.role() || m.role === this.role()) &&
      (!this.availability() || m.state === this.availability()));
  });
  readonly selected = computed<TeamMember | null>(() => this.filteredMembers().find(m => m.id === this.selectedId()) ?? this.filteredMembers()[0] ?? null);
  presenceClass(member: TeamMember): string {
    return member.state === 'Disponible' ? 'online' : member.state === 'Ausente' ? 'away' : 'neutral';
  }
  clearFilters(): void {
    this.query.set(''); this.role.set(''); this.availability.set(''); this.group.set('all');
  }
}

