import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { KnowledgeEditorComponent } from './knowledge-editor.component';
import { ARTICLES } from './knowledge.data';

describe('Approved Knowledge editor', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([
    { path: 'knowledge-base/nuevo', component: KnowledgeEditorComponent },
    { path: 'knowledge-base/:id/editar', component: KnowledgeEditorComponent },
  ])] }));
  it('prefills each record and resets when creating another article', async () => {
    const harness = await RouterTestingHarness.create();
    for (const article of ARTICLES) {
      const page = await harness.navigateByUrl(`/knowledge-base/${article.id}/editar`, KnowledgeEditorComponent);
      expect(page.form.getRawValue()).toEqual({ title: article.title, content: article.content, category: article.category });
      expect(page.status()).toBe(article.status);
      page.form.controls.title.setValue('Local change');
    }
    const page = await harness.navigateByUrl('/knowledge-base/nuevo', KnowledgeEditorComponent);
    expect(page.editing()).toBeFalse(); expect(page.form.controls.title.value).toBe(''); expect(page.form.controls.content.value).toBe('');
  });
  it('rejects blank and oversized text without opening publication', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/knowledge-base/nuevo', KnowledgeEditorComponent);
    page.form.patchValue({ title: '   ', content: '  ' }); page.saveDraft(); page.requestPublish(); harness.detectChanges();
    expect(page.feedback()).toBe(''); expect(page.form.invalid).toBeTrue();
    expect(harness.routeNativeElement!.querySelector('dialog')!.open).toBeFalse();
    page.form.patchValue({ title: 'x'.repeat(121), content: 'x'.repeat(6001) }); expect(page.form.invalid).toBeTrue();
  });
  it('saves and publishes only a simulated state without changing fixtures', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/knowledge-base/4/editar', KnowledgeEditorComponent);
    page.saveDraft(); expect(page.status()).toBe('Borrador · Demo');
    page.requestPublish(); harness.detectChanges();
    const dialog = harness.routeNativeElement!.querySelector('dialog')!;
    expect(dialog.open).toBeTrue();
    dialog.querySelector<HTMLButtonElement>('.primary')!.click(); harness.detectChanges();
    expect(dialog.open).toBeFalse(); expect(page.status()).toBe('Publicado · Demo');
    expect(page.feedback()).toContain('simulada'); expect(ARTICLES[4].status).toBe('Borrador');
  });
  it('shows missing article instead of exposing a new or unrelated form', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/knowledge-base/no-existe/editar', KnowledgeEditorComponent);
    expect(page.missing()).toBeTrue(); expect(harness.routeNativeElement!.querySelector('form')).toBeNull();
    page.form.patchValue({ title: 'Title', content: 'Content' }); page.saveDraft(); page.publish();
    expect(page.feedback()).toBe('');
  });
});
