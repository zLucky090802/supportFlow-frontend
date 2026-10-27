import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { KnowledgeBaseComponent } from './knowledge-base.component';

describe('Approved Knowledge Base list', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'knowledge-base', component: KnowledgeBaseComponent }])] }));
  it('renders six articles, published/draft totals and selectable preview', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/knowledge-base', KnowledgeBaseComponent);
    expect(page.tabs.map(tab => tab.count)).toEqual([6, 4, 2]);
    expect(harness.routeNativeElement!.querySelectorAll('tbody tr').length).toBe(6);
    harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('.row-title')[4].click(); harness.detectChanges();
    expect(page.selected()?.id).toBe('4');
    expect(harness.routeNativeElement!.querySelector('.detail')?.textContent).toContain('Preguntas sobre facturación');
  });
  it('combines normalized search/category/status and restores empty results', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/knowledge-base', KnowledgeBaseComponent);
    page.query.set('  FACTURACION  '); page.category.set('Facturación'); page.filter.set('Borrador');
    expect(page.filtered().map(article => article.id)).toEqual(['4']);
    page.filter.set('Publicado'); harness.detectChanges();
    expect(page.selected()).toBeNull(); expect(harness.routeNativeElement!.querySelector('.detail')).toBeNull();
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('.empty button')!.click(); harness.detectChanges();
    expect(page.filtered().length).toBe(6);
  });
  it('shows loading, empty and error demonstrations and recovers', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/knowledge-base', KnowledgeBaseComponent);
    for (const state of ['loading', 'empty', 'error']) {
      page.viewState.set(state); harness.detectChanges();
      expect(harness.routeNativeElement!.querySelector('table')).toBeNull();
      expect(harness.routeNativeElement!.querySelector('.state-box h2')?.textContent).toBe(page.stateTitle());
      harness.routeNativeElement!.querySelector<HTMLButtonElement>('.state-box button')!.click(); harness.detectChanges();
      expect(page.viewState()).toBe('ready');
    }
  });
});
