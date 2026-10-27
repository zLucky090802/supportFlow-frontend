import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';
import { InboxComponent } from '../inbox/inbox.component';
import { routes } from '../../app.routes';

describe('Approved Home', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));
  it('renders four metrics, three previews and the consolidated Home navigation', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard', DashboardComponent);
    const root = harness.routeNativeElement!;
    expect(root.querySelectorAll('.metric').length).toBe(4);
    expect(root.querySelectorAll('.queue-row').length).toBe(3);
    expect(root.querySelector('app-sidebar a[aria-current="page"]')?.textContent).toContain('Home');
    expect(root.querySelector('app-sidebar')?.textContent).not.toContain('Analytics');
    expect(root.textContent).toContain('Sin conexión al backend');
  });
  it('combines global filters and keeps chart and channel totals consistent', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/dashboard', DashboardComponent);
    component.period.set('30'); component.channel.set('WhatsApp'); component.owner.set('Camila Torres'); component.team.set('Soporte');
    expect(component.rows().length).toBeGreaterThan(0);
    expect(component.rows().every(e => e.channel === 'WhatsApp' && e.owner === 'Camila Torres' && e.team === 'Soporte')).toBeTrue();
    expect(component.buckets().reduce((n, b) => n + b.count, 0)).toBe(component.rows().length);
    expect(component.distribution().reduce((n, b) => n + b.count, 0)).toBe(component.rows().length);
    expect(component.visibleConversations().length).toBe(3);
  });
  it('rejects reversed dates without replacing the applied range and supports empty periods', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/dashboard', DashboardComponent);
    component.period.set('custom'); const range = component.range();
    component.from = '2026-10-26'; component.to = '2026-10-20'; component.applyRange();
    expect(component.rangeError()).not.toBe(''); expect(component.range()).toEqual(range);
    component.from = '2025-01-01'; component.to = '2025-01-02'; component.applyRange();
    expect(component.rows().length).toBe(0); expect(component.normal()).toBeFalse();
    component.reset(); expect(component.normal()).toBeTrue();
  });
  it('filters operational queue independently and opens the matching inbox conversation', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/dashboard', DashboardComponent);
    const buttons = harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('.queue-tabs button');
    buttons[1].click(); harness.detectChanges();
    expect(component.visibleConversations().map(c => c.id)).toEqual([1, 2]);
    component.channel.set('Instagram'); harness.detectChanges();
    expect(component.visibleConversations().map(c => c.id)).toEqual([1, 2]);
    for (const id of [1, 2, 3]) {
      await harness.navigateByUrl('/dashboard', DashboardComponent); component.filter.set('all'); harness.detectChanges();
      const link = harness.routeNativeElement!.querySelectorAll<HTMLAnchorElement>('.queue-person')[id - 1];
      expect(link.getAttribute('href')).toBe(`/bandeja?conversacion=${id}`);
      const inbox = await harness.navigateByUrl(link.getAttribute('href')!, InboxComponent);
      expect(inbox.selectedConversation().id).toBe(id);
    }
  });
  it('recovers loading and error states without losing filters or current queue', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/dashboard', DashboardComponent);
    component.channel.set('Correo'); component.filter.set('unassigned');
    for (const state of ['loading', 'error'] as const) {
      component.state.set(state); harness.detectChanges();
      const root = harness.routeNativeElement!;
      expect(root.querySelector('.state-box h2')?.textContent).toBe(component.stateTitle());
      expect(root.querySelectorAll('.queue-row').length).toBe(2);
      root.querySelector<HTMLButtonElement>('.state-box button')!.click(); harness.detectChanges();
      expect(component.state()).toBe('default'); expect(component.channel()).toBe('Correo');
    }
  });
});
