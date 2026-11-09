import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Store } from '@ngrx/store';
import { AdminDemoStore } from '../../../features/admin/admin-demo.store';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { logoutRequested } from '../../../core/auth/auth.actions';
import { selectCurrentUser } from '../../../core/auth/auth.selectors';
import { AppIconComponent, AppIconName } from '../app-icon/app-icon.component';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, AppIconComponent],
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSidebarComponent {
  readonly workspace = inject(AdminDemoStore);
  private readonly store = inject(Store);
  readonly user = this.store.selectSignal(selectCurrentUser);
  private readonly router = inject(Router);
  readonly profileInitials = computed(() => (this.user()?.name ?? 'SF').split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase());
  readonly compact = input(false);
  readonly compactChange = output<boolean>();
  signOut(): void { this.store.dispatch(logoutRequested()); void this.router.navigateByUrl('/login'); }
  readonly items: ReadonlyArray<{ label: string; icon: AppIconName; path?: string }> = [
    { label: 'Home', icon: 'home', path: '/dashboard' },
    { label: 'Conversations', icon: 'inbox', path: '/bandeja' },
    { label: 'Customers', icon: 'users', path: '/contactos' },
    { label: 'Team', icon: 'person', path: '/team' },
    { label: 'AI Agent', icon: 'sparkles', path: '/ai-agent' },
    { label: 'Knowledge Base', icon: 'book', path: '/knowledge-base' },
    { label: 'Administración', icon: 'users', path: '/admin/usuarios' },
  ];
}

