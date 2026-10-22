import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { TeamComponent } from './team.component';

describe('Approved Team page', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('renders the team, totals and active navigation', async () => {
    const harness = await RouterTestingHarness.create();
    const team = await harness.navigateByUrl('/team', TeamComponent);
    expect(team.memberCount).toBe(4);
    expect(team.availableCount).toBe(2);
    expect(team.openChats).toBe(12);
    expect(harness.routeNativeElement!.querySelectorAll('tbody tr').length).toBe(6);
    expect(harness.routeNativeElement!.querySelector('a[aria-current="page"]')?.textContent).toContain('Team');
    expect(harness.routeNativeElement!.textContent).toContain('Sin conexión al backend');
  });

  it('combines accent-insensitive search, group, role and availability filters', async () => {
    const harness = await RouterTestingHarness.create();
    const team = await harness.navigateByUrl('/team', TeamComponent);
    team.query.set('  ANDRES  '); team.group.set('invited'); team.role.set('Agente'); team.availability.set('Invitación pendiente');
    harness.detectChanges();
    expect(team.filteredMembers().map(m => m.name)).toEqual(['Andrés López']);
    expect(team.selected()?.name).toBe('Andrés López');
    expect(harness.routeNativeElement!.querySelector('.workload-card')?.textContent).toContain('Disponible cuando acepte');
    team.role.set('Administrador'); harness.detectChanges();
    expect(team.selected()).toBeNull();
    expect(harness.routeNativeElement!.querySelector('.member-detail')).toBeNull();
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('.empty button')!.click(); harness.detectChanges();
    expect(team.filteredMembers().length).toBe(6);
    expect(harness.routeNativeElement!.querySelector('.member-detail')).not.toBeNull();
  });

  it('selects a member through the row button and filters invitations through tabs', async () => {
    const harness = await RouterTestingHarness.create();
    const team = await harness.navigateByUrl('/team', TeamComponent);
    harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('.member-button')[1].click(); harness.detectChanges();
    expect(team.selected()?.role).toBe('Administrador');
    expect(harness.routeNativeElement!.querySelector('.permission-note')?.textContent).toContain('Gestiona el espacio');
    harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('.tabs button')[2].click(); harness.detectChanges();
    expect(team.filteredMembers().length).toBe(2);
    expect(team.selected()?.group).toBe('invited');
    expect(harness.routeNativeElement!.querySelector('.tabs button[aria-pressed="true"]')?.textContent).toContain('Invitaciones');
  });

  it('shows demonstration states and restores the previous filter', async () => {
    const harness = await RouterTestingHarness.create();
    const team = await harness.navigateByUrl('/team', TeamComponent);
    team.group.set('members');
    for (const state of ['empty', 'loading', 'error'] as const) {
      team.view.set(state); harness.detectChanges();
      expect(harness.routeNativeElement!.querySelector('table')).toBeNull();
      expect(harness.routeNativeElement!.querySelector('.view-message h2')?.textContent).toBe(team.viewCopy().title);
      harness.routeNativeElement!.querySelector<HTMLButtonElement>('.view-message button')!.click(); harness.detectChanges();
      expect(team.view()).toBe('default');
      expect(harness.routeNativeElement!.querySelectorAll('tbody tr').length).toBe(4);
    }
  });

  it('explains invitations without creating a member or sending an email', async () => {
    const harness = await RouterTestingHarness.create();
    const team = await harness.navigateByUrl('/team', TeamComponent);
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('.top .primary')!.click();
    const dialog = harness.routeNativeElement!.querySelector('dialog')!;
    expect(dialog.open).toBeTrue();
    expect(dialog.textContent).toContain('no envía correos');
    expect(team.members.length).toBe(6);
    dialog.close();
  });

  it('enables the dashboard team link and retains sidebar collapse', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard', DashboardComponent);
    const link = harness.routeNativeElement!.querySelector<HTMLAnchorElement>('a.card-link[href="/team"]')!;
    expect(link).not.toBeNull();
    const team = await harness.navigateByUrl(link.getAttribute('href')!, TeamComponent);
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('app-sidebar .collapse')!.click(); harness.detectChanges();
    expect(team.compact()).toBeTrue();
    expect(harness.routeNativeElement!.querySelector('app-sidebar .collapse')?.getAttribute('aria-expanded')).toBe('false');
  });
});
