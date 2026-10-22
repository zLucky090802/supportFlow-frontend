import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { DASHBOARD_CONVERSATIONS, DASHBOARD_STATES, DashboardState } from './dashboard.data';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterLink, AppIconComponent, AppSidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly today = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Bogota' }).format(new Date());
  readonly compact = signal(false);
  readonly filter = signal<'all' | 'unassigned'>('all');
  readonly state = signal<DashboardState>('default');
  readonly visibleConversations = computed(() => DASHBOARD_CONVERSATIONS.filter(
    conversation => this.filter() === 'all' || conversation.owner === null,
  ));
  readonly stateTitle = computed(() => DASHBOARD_STATES[this.state()].title);
  readonly stateDescription = computed(() => DASHBOARD_STATES[this.state()].description);
}

