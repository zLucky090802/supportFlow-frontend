import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AGENTS, AgentRecord, AgentStatus, agentStateDescription } from './agents.data';
const normalize = (value: string): string => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
@Component({
  selector: 'app-agents',
  imports: [FormsModule, RouterLink, AppIconComponent, AppSidebarComponent],
  templateUrl: './agents.component.html',
  styleUrl: './agents.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentsComponent {
  readonly compact = signal(false);
  readonly agents = AGENTS;
  readonly query = signal('');
  readonly filter = signal<AgentStatus | 'Todos'>('Todos');
  readonly selectedId = signal('1');
  readonly emptyDemo = signal(false);
  readonly activeCount = AGENTS.filter(a => a.state === 'Activo').length;
  readonly tabs = [
    { id: 'Todos' as const, label: 'Todos', count: AGENTS.length },
    ...(['Activo', 'Borrador', 'Pausado'] as const).map(id => ({ id, label: { Activo: 'Activos', Borrador: 'Borradores', Pausado: 'Pausados' }[id], count: AGENTS.filter(a => a.state === id).length })),
  ];
  readonly filtered = computed(() => this.agents.filter(a =>
    (this.filter() === 'Todos' || a.state === this.filter()) &&
    normalize(a.name + ' ' + a.purpose).includes(normalize(this.query().trim()))));
  readonly selected = computed<AgentRecord | null>(() => this.filtered().find(a => a.id === this.selectedId()) ?? this.filtered()[0] ?? null);
  readonly description = computed(() => this.selected() ? agentStateDescription(this.selected()!.state) : '');
  clearFilters(): void { this.query.set(''); this.filter.set('Todos'); }
}

