import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AgentActivationComponent } from './agent-activation.component';
import { routes } from '../../app.routes';
import { SettingsComponent } from '../settings/settings.component';
import { NewAgentComponent } from './new-agent.component';

describe('Agent activation', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));
  it('connects configuration, activation and channel settings through application routes', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/ai-agent/2/configuracion', NewAgentComponent);
    const link = harness.routeNativeElement!.querySelector<HTMLAnchorElement>('a[href="/ai-agent/2/activar"]')!;
    expect(link).not.toBeNull();
    await harness.navigateByUrl(link.getAttribute('href')!, AgentActivationComponent);
    const channelLink = harness.routeNativeElement!.querySelector<HTMLAnchorElement>('a[href="/settings?section=channels"]')!;
    const settings = await harness.navigateByUrl(channelLink.getAttribute('href')!, SettingsComponent);
    expect(settings.section()).toBe('channels');
  });
  it('requires a supported channel and every review before confirmation', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/ai-agent/2/activar', AgentActivationComponent);
    const dialog = harness.routeNativeElement!.querySelector('dialog')!;
    const show = spyOn(dialog, 'showModal');
    page.review(dialog); expect(show).not.toHaveBeenCalled(); expect(page.form.invalid).toBeTrue();
    page.form.setValue({ channel: 'instagram', identityReviewed: true, knowledgeReviewed: true, handoffReviewed: true });
    page.review(dialog); expect(show).not.toHaveBeenCalled();
    page.form.controls.channel.setValue('whatsapp-demo'); page.review(dialog);
    expect(show).toHaveBeenCalledTimes(1); expect(page.activated()).toBeFalse();
  });
  it('simulates activation without changing shared records and resets on route change', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/ai-agent/2/activar', AgentActivationComponent);
    page.form.setValue({ channel: 'whatsapp-demo', identityReviewed: true, knowledgeReviewed: true, handoffReviewed: true });
    page.activate(); expect(page.activated()).toBeTrue(); expect(page.agent()?.state).toBe('Borrador');
    expect(page.feedback()).toContain('simulada'); expect(page.form.disabled).toBeTrue();
    const next = await harness.navigateByUrl('/ai-agent/4/activar', AgentActivationComponent);
    expect(next.activated()).toBeFalse(); expect(next.form.enabled).toBeTrue(); expect(next.form.controls.channel.value).toBe('');
  });
  it('does not allow activation for unknown or already active records', async () => {
    const harness = await RouterTestingHarness.create();
    for (const id of ['missing', '1']) {
      const page = await harness.navigateByUrl(`/ai-agent/${id}/activar`, AgentActivationComponent);
      page.form.setValue({ channel: 'whatsapp-demo', identityReviewed: true, knowledgeReviewed: true, handoffReviewed: true });
      page.activate(); expect(page.activated()).toBeFalse();
      expect(harness.routeNativeElement!.querySelector('select')).toBeNull();
    }
  });
});
