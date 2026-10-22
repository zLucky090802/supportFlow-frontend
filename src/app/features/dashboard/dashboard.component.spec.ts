import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';
import { InboxComponent } from '../inbox/inbox.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { routes } from '../../app.routes';

describe('Approved Dashboard', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('renders the approved cards, sample data disclosure and eight MVP destinations', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard', DashboardComponent);
    const root = harness.routeNativeElement!;
    expect(root.querySelectorAll('.stat').length).toBe(4);
    expect(root.querySelectorAll('.queue-item').length).toBe(4);
    expect(root.querySelectorAll('app-sidebar nav a, app-sidebar nav button').length).toBe(8);
    expect(root.querySelectorAll('app-sidebar button:disabled').length).toBe(5);
    expect(root.querySelector('app-sidebar .bottom .label')?.textContent).toContain('ESPACIO DE TRABAJO');
    expect(root.querySelector('app-sidebar .bottom .team')?.textContent).toContain('Support Flow');
    expect(root.querySelector('app-sidebar a[aria-current="page"]')?.textContent).toContain('Dashboard');
    expect(root.textContent).toContain('Sin conexión al backend');
    expect(root.querySelector('.chart')?.getAttribute('aria-label')).toContain('Total: 64');
  });

  it('filters unassigned conversations through the actual controls and restores all', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard', DashboardComponent);
    const root = harness.routeNativeElement!;
    const buttons = root.querySelectorAll<HTMLButtonElement>('.mini-tabs button');
    buttons[1].click(); harness.detectChanges();
    expect(root.querySelectorAll('.queue-item').length).toBe(2);
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('.detail-footer')?.textContent).toContain('2 de 4');
    buttons[0].click(); harness.detectChanges();
    expect(root.querySelectorAll('.queue-item').length).toBe(4);
  });

  it('opens each preview in the matching inbox conversation', async () => {
    const harness = await RouterTestingHarness.create();
    for (const id of [1, 2, 3, 4]) {
      await harness.navigateByUrl('/dashboard', DashboardComponent);
      const link = harness.routeNativeElement!.querySelectorAll<HTMLAnchorElement>('.queue-person')[id - 1];
      expect(link.getAttribute('href')).toBe(`/bandeja?conversacion=${id}`);
      const inbox = await harness.navigateByUrl(link.getAttribute('href')!, InboxComponent);
      expect(inbox.selectedConversation().id).toBe(id);
    }
  });

  it('toggles the sidebar and preserves access from the existing pages', async () => {
    const harness = await RouterTestingHarness.create();
    const dashboard = await harness.navigateByUrl('/dashboard', DashboardComponent);
    const toggle = harness.routeNativeElement!.querySelector<HTMLButtonElement>('app-sidebar .collapse')!;
    toggle.click(); harness.detectChanges();
    expect(dashboard.compact()).toBeTrue();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click(); harness.detectChanges();
    expect(dashboard.compact()).toBeFalse();
    for (const path of ['/contactos', '/bandeja']) {
      await harness.navigateByUrl(path);
      expect(harness.routeNativeElement!.querySelector('app-sidebar a[href="/dashboard"]')).not.toBeNull();
    }
    await harness.navigateByUrl('/contactos', ContactsComponent);
    expect(harness.routeNativeElement!.querySelector('app-sidebar a[aria-current="page"]')?.textContent).toContain('Customers');
  });

  it('shows empty, loading and error states and recovers without losing the filter', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/dashboard', DashboardComponent);
    component.filter.set('unassigned');
    for (const state of ['empty', 'loading', 'error'] as const) {
      component.state.set(state); harness.detectChanges();
      const root = harness.routeNativeElement!;
      expect(root.querySelector<HTMLElement>('#dashboard-content')!.hidden).toBeTrue();
      expect(root.querySelector<HTMLElement>('.state-panel')!.hidden).toBeFalse();
      expect(root.querySelector('.state-panel h2')?.textContent).toBe(component.stateTitle());
      expect(root.querySelector('.loading-line') !== null).toBe(state === 'loading');
      root.querySelector<HTMLButtonElement>('.state-panel button')!.click(); harness.detectChanges();
      expect(component.state()).toBe('default');
      expect(component.visibleConversations().length).toBe(2);
    }
  });
});
