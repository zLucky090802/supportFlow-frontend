import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RecoverAccessComponent } from './recover-access.component';
describe('Access recovery demonstration',()=>{
 beforeEach(()=>TestBed.configureTestingModule({imports:[RecoverAccessComponent],providers:[provideRouter([])]}));
 it('validates email and displays a generic response without disclosing account existence',()=>{const fixture=TestBed.createComponent(RecoverAccessComponent);const page=fixture.componentInstance;page.form.setValue({email:'bad'});page.submit();expect(page.done()).toBeFalse();page.form.setValue({email:'persona@example.com'});page.submit();fixture.detectChanges();expect(page.done()).toBeTrue();expect(fixture.nativeElement.textContent).toContain('Si existe una cuenta');expect(fixture.nativeElement.textContent).toContain('no envía mensajes');});
});
