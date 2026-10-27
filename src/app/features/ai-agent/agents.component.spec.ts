import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { AgentsComponent } from './agents.component';
import { NewAgentComponent } from './new-agent.component';
import { AGENTS } from './agents.data';

describe('Agent list and configuration', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));
  it('filters by status and normalized purpose and clears empty results', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/ai-agent', AgentsComponent);
    page.filter.set('Borrador'); expect(page.filtered().length).toBe(2);
    page.query.set('COMERCIAL'); expect(page.filtered().map(a => a.id)).toEqual(['2']);
    page.query.set('missing'); expect(page.selected()).toBeNull();
    page.clearFilters(); expect(page.filtered().length).toBe(4);
  });
  it('links the selected record to its configuration', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/ai-agent', AgentsComponent);
    page.selectedId.set('3'); harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('#view-config')?.getAttribute('href')).toBe('/ai-agent/3/configuracion');
  });
  it('loads each selected configuration and resets the create form', async () => {
    const harness = await RouterTestingHarness.create();
    for (const record of AGENTS) {
      const page = await harness.navigateByUrl(`/ai-agent/${record.id}/configuracion`, NewAgentComponent);
      expect(page.form.controls.name.value).toBe(record.name);
      expect(page.form.controls.tone.value).toBe(record.tone);
      expect(page.form.controls.instructions.value).toBe(record.instructions);
      page.form.controls.name.setValue('Local edit');
    }
    const fresh = await harness.navigateByUrl('/ai-agent/nuevo', NewAgentComponent);
    expect(fresh.agent()).toBeNull(); expect(fresh.form.controls.name.value).toBe('');
  });
  it('does not silently create a record for an unknown identifier', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/ai-agent/missing/configuracion', NewAgentComponent);
    expect(page.notFound()).toBeTrue();
    expect(harness.routeNativeElement!.querySelector('#agent-form')).toBeNull();
    page.form.controls.name.setValue('Valid'); page.save(); expect(page.feedback()).toBe('');
  });
});
