import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { NewAgentComponent } from './new-agent.component';

describe('New agent form', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('opens a blank-name new agent and marks the navigation active', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/ai-agent/nuevo', NewAgentComponent);
    expect(page.form.controls.name.value).toBe('');
    expect(harness.routeNativeElement!.querySelector('h1')?.textContent).toBe('Nuevo agente');
    expect(harness.routeNativeElement!.querySelector('a[aria-current="page"]')?.textContent).toContain('AI Agent');
    expect(harness.routeNativeElement!.querySelector<HTMLButtonElement>('#save-button')!.disabled).toBeTrue();
  });

  it('validates blank values and maximum lengths without saving', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/ai-agent/nuevo', NewAgentComponent);
    for (const name of ['', '   ', 'a'.repeat(61)]) {
      page.form.controls.name.setValue(name); page.save();
      expect(page.form.invalid).toBeTrue(); expect(page.feedback()).toBe('');
    }
    page.form.controls.name.setValue('Soporte');
    for (const instructions of ['', ' \n ', 'a'.repeat(1201)]) {
      page.form.controls.instructions.setValue(instructions); page.save();
      expect(page.form.invalid).toBeTrue(); expect(page.feedback()).toBe('');
    }
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('[role="alert"]')).not.toBeNull();
    page.form.patchValue({ name: 'a'.repeat(60), instructions: 'a'.repeat(1200) });
    expect(page.form.valid).toBeTrue();
  });

  it('updates preview identity using the real form controls without pretending to generate replies', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/ai-agent/nuevo', NewAgentComponent);
    const input = harness.routeNativeElement!.querySelector<HTMLInputElement>('#agent-name')!;
    input.value = 'Asistente comercial'; input.dispatchEvent(new Event('input')); harness.detectChanges();
    const tone = harness.routeNativeElement!.querySelector<HTMLSelectElement>('#agent-tone')!;
    tone.value = 'Formal'; tone.dispatchEvent(new Event('change')); harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('#preview-name')?.textContent).toBe('Asistente comercial');
    expect(page.values().tone).toBe('Formal');
    const reply = page.example().reply;
    page.form.controls.instructions.setValue('Habla de otro tema'); harness.detectChanges();
    expect(page.example().reply).toBe(reply);
    expect(harness.routeNativeElement!.querySelector('#instruction-count')?.textContent).toContain('18 / 1200');
  });

  it('switches predefined scenarios and simulates a draft submission', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/ai-agent/nuevo', NewAgentComponent);
    harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('.questions button')[2].click(); harness.detectChanges();
    expect(page.scenario()).toBe('human');
    expect(harness.routeNativeElement!.querySelector('#source-text')?.textContent).toContain('Sin asignar');
    page.form.controls.name.setValue('Asistente'); harness.detectChanges();
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('#save-button')!.click(); harness.detectChanges();
    expect(page.feedback()).toContain('Guardado simulado');
    page.form.controls.name.setValue('Otro nombre');
    expect(page.feedback()).toBe('');
    await harness.navigateByUrl('/dashboard');
    const fresh = await harness.navigateByUrl('/ai-agent/nuevo', NewAgentComponent);
    expect(fresh.form.controls.name.value).toBe('');
  });
});
