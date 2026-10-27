import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ResetAccessComponent } from './reset-access.component';
describe('Password reset demonstration',()=>{
 beforeEach(()=>TestBed.configureTestingModule({imports:[ResetAccessComponent],providers:[provideRouter([])]}));
 it('requires a matching pair of sufficient length and clears passwords after success',()=>{const page=TestBed.createComponent(ResetAccessComponent).componentInstance;page.form.setValue({password:'short',confirmation:'short'});page.submit();expect(page.done()).toBeFalse();page.form.setValue({password:'demo1234',confirmation:'demo1235'});page.submit();expect(page.form.hasError('mismatch')).toBeTrue();expect(page.done()).toBeFalse();page.form.controls.confirmation.setValue('demo1234');page.submit();expect(page.done()).toBeTrue();expect(page.form.getRawValue()).toEqual({password:'',confirmation:''});});
});
