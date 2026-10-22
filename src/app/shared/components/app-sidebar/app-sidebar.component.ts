import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppIconComponent, AppIconName } from '../app-icon/app-icon.component';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, AppIconComponent],
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSidebarComponent {
  readonly compact = input(false);
  readonly compactChange = output<boolean>();
  readonly items: ReadonlyArray<{ label: string; icon: AppIconName; path?: string }> = [
    { label: 'Dashboard', icon: 'home', path: '/dashboard' },
    { label: 'Conversations', icon: 'inbox', path: '/bandeja' },
    { label: 'Customers', icon: 'users', path: '/contactos' },
    { label: 'Team', icon: 'person' },
    { label: 'AI Agent', icon: 'sparkles' },
    { label: 'Knowledge Base', icon: 'book' },
    { label: 'Analytics', icon: 'chart' },
  ];
}

