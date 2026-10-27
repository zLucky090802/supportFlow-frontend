import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { SettingsComponent } from './settings.component';

describe('Settings', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'settings', component: SettingsComponent }])] }));

  it('opens the requested section and falls back safely for unknown sections', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/settings?section=channels', SettingsComponent);
    expect(page.section()).toBe('channels');
    expect(harness.routeNativeElement!.querySelector('a[href="/settings/canales"]')).not.toBeNull();
    await harness.navigateByUrl('/settings?section=unknown');
    expect(page.section()).toBe('workspace');
  });

  it('validates workspace/profile names and clears simulated feedback on edits', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/settings', SettingsComponent);
    page.workspace.controls.name.setValue('   '); page.save('workspace');
    expect(page.workspace.invalid).toBeTrue(); expect(page.feedback()).toBe('');
    page.workspace.controls.name.setValue('Support'); page.save('workspace');
    expect(page.feedback()).toContain('simulada');
    page.workspace.controls.name.setValue('Otro'); expect(page.feedback()).toBe('');
    page.profile.controls.name.setValue('x'.repeat(101)); page.save('profile');
    expect(page.profile.invalid).toBeTrue(); expect(page.feedback()).toBe('');
  });

  it('rejects missing days, overnight intervals and whitespace messages', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/settings?section=hours', SettingsComponent);
    page.hours.controls.days.controls.forEach(day => day.setValue(false)); page.save('hours');
    expect(page.hours.invalid).toBeTrue();
    page.hours.controls.days.at(0).setValue(true);
    page.hours.patchValue({ start: '18:00', end: '08:00' }); page.save('hours');
    expect(page.feedback()).toBe(''); expect(page.hours.invalid).toBeTrue();
    page.hours.patchValue({ start: '08:00', end: '18:00', message: '  ' }); page.save('hours');
    expect(page.hours.invalid).toBeTrue();
    page.hours.controls.message.setValue('Volvemos pronto.'); page.save('hours');
    expect(page.feedback()).toContain('Horario guardado de forma simulada');
  });

  it('links to channel management and recovers demo errors', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/settings?section=channels', SettingsComponent);
    expect(harness.routeNativeElement!.querySelector('a[href="/settings/canales"]')).not.toBeNull();
    page.changeView('error'); harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('.state-box')?.textContent).toContain('No pudimos cargar');
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('.state-box button')!.click();
    expect(page.view()).toBe('ready');
  });
});
