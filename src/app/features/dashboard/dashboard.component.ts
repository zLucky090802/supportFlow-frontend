import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { DASHBOARD_CONVERSATIONS } from './dashboard.data';

const ANCHOR = '2026-10-26';
const CHANNELS = ['WhatsApp', 'Instagram', 'Correo'];
const OWNERS = ['Daniel Espitia', 'Camila Torres', 'Asistente de soporte · IA'];
const dateAfter = (date: string, days: number) => new Date(Date.parse(date + 'T12:00:00Z') + days * 86400000).toISOString().slice(0, 10);
const EVENTS = Array.from({ length: 30 }, (_, day) => Array.from({ length: 18 + day % 5 * 3 }, (_, i) => ({
  date: dateAfter(ANCHOR, -day), channel: CHANNELS[(i + day) % 3], owner: OWNERS[(i * 2 + day) % 3],
  team: i % 2 ? 'Ventas' : 'Soporte', resolved: i % 3 !== 0, response: 60 + i % 6 * 30,
}))).flat();

@Component({ selector: 'app-dashboard', imports: [FormsModule, RouterLink, AppSidebarComponent], templateUrl: './dashboard.component.html', styleUrl: './dashboard.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class DashboardComponent {
  readonly compact = signal(false);
  readonly filter = signal<'all' | 'unassigned'>('all');
  readonly state = signal<'default' | 'empty' | 'loading' | 'error'>('default');
  readonly period = signal('7');
  readonly channel = signal('');
  readonly owner = signal('');
  readonly team = signal('');
  readonly channels = CHANNELS;
  readonly owners = OWNERS;
  from = '2026-10-20';
  to = ANCHOR;
  readonly appliedRange = signal({ from: this.from, to: this.to });
  readonly rangeError = signal('');
  readonly range = computed(() => this.period() === 'custom' ? this.appliedRange() : { from: dateAfter(ANCHOR, 1 - Number(this.period())), to: ANCHOR });
  readonly rows = computed(() => EVENTS.filter(e => e.date >= this.range().from && e.date <= this.range().to && (!this.channel() || e.channel === this.channel()) && (!this.owner() || e.owner === this.owner()) && (!this.team() || e.team === this.team())));
  readonly metrics = computed(() => {
    const rows = this.rows();
    return [
      { title: 'Conversaciones recibidas', value: rows.length, help: 'Iniciadas dentro del período' },
      { title: 'Resueltas', value: rows.filter(e => e.resolved).length, help: 'De las recibidas en el período' },
      { title: 'Resueltas por IA', value: rows.filter(e => e.resolved && e.owner.includes('IA')).length, help: 'Sin intervención del equipo' },
      { title: 'Primera respuesta', value: rows.length ? (rows.reduce((n, e) => n + e.response, 0) / rows.length / 60).toFixed(1) + ' min' : '—', help: 'Promedio de conversaciones respondidas' },
    ];
  });
  readonly buckets = computed(() => {
    const { from, to } = this.range();
    const span = Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1;
    const size = Math.max(1, Math.ceil(span / 7));
    const buckets = Array.from({ length: Math.ceil(span / size) }, (_, i) => {
      const start = dateAfter(from, i * size), end = dateAfter(from, Math.min((i + 1) * size, span) - 1);
      return { label: new Date(start + 'T12:00:00Z').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: 'UTC' }), count: this.rows().filter(e => e.date >= start && e.date <= end).length };
    });
    const max = Math.max(1, ...buckets.map(b => b.count));
    return buckets.map(b => ({ ...b, height: b.count / max * 125 }));
  });
  readonly distribution = computed(() => CHANNELS.map(name => {
    const count = this.rows().filter(e => e.channel === name).length;
    return { name, count, percent: this.rows().length ? Math.round(count / this.rows().length * 100) : 0 };
  }));
  readonly visibleConversations = computed(() => DASHBOARD_CONVERSATIONS.slice(0, 3).filter(c => this.filter() === 'all' || c.owner === null));
  readonly normal = computed(() => this.state() === 'default' && this.rows().length > 0);
  readonly stateTitle = computed(() => this.state() === 'loading' ? 'Preparando las métricas' : this.state() === 'error' ? 'No pudimos cargar las métricas' : 'No hay actividad con estos filtros');
  applyRange(): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(this.from) || !/^\d{4}-\d{2}-\d{2}$/.test(this.to) || !Number.isFinite(Date.parse(this.from)) || !Number.isFinite(Date.parse(this.to)) || this.from > this.to) {
      this.rangeError.set('La fecha inicial debe ser anterior o igual a la final.'); return;
    }
    this.rangeError.set(''); this.appliedRange.set({ from: this.from, to: this.to });
  }
  reset(): void { this.period.set('7'); this.channel.set(''); this.owner.set(''); this.team.set(''); this.state.set('default'); this.rangeError.set(''); }
}
