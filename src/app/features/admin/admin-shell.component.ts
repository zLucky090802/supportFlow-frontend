import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AdminDemoStore } from './admin-demo.store';
@Component({
  selector: 'app-admin-shell', imports: [AppSidebarComponent, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush, styleUrl: './admin-shared.scss',
  template: `<main class="app" [class.compact]="compact()">
    <app-sidebar [compact]="compact()" (compactChange)="compact.set($event)" />
    <section class="page"><header class="top"><div><p class="eyebrow">ADMINISTRACIÓN GLOBAL</p><h1>Personas y equipos</h1><p class="subtitle">Un lugar para cuidar el acceso y la organización de tu equipo.</p></div><span class="badge draft">Solo demostración</span></header>
      <nav class="tabs" aria-label="Secciones de administración">
        <a routerLink="/admin/usuarios" routerLinkActive="active" ariaCurrentWhenActive="page">Usuarios <b>{{ store.users().length }}</b></a>
        <a routerLink="/admin/equipos" routerLinkActive="active" ariaCurrentWhenActive="page">Equipos <b>{{ store.teams().length }}</b></a>
        <a routerLink="/cambiar-equipo" routerLinkActive="active" ariaCurrentWhenActive="page">Cambiar equipo</a>
      </nav><ng-content /><footer class="demo-note">Datos de ejemplo · Los cambios duran durante esta sesión de demostración y se reinician al recargar.</footer>
    </section></main>`,
})
export class AdminShellComponent { readonly compact = signal(false); readonly store = inject(AdminDemoStore); }
