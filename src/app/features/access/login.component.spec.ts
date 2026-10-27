import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
describe('Login demonstration',()=>{
 beforeEach(()=>TestBed.configureTestingModule({imports:[LoginComponent],providers:[provideRouter([])]}));
 it('rejects invalid credentials and clears values after a simulated success',()=>{const page=TestBed.createComponent(LoginComponent).componentInstance;page.submit();expect(page.done()).toBeFalse();page.form.setValue({email:'invalid',password:'demo'});page.submit();expect(page.done()).toBeFalse();page.form.setValue({email:'persona@example.com',password:'demo'});page.submit();expect(page.done()).toBeTrue();expect(page.form.getRawValue()).toEqual({email:'',password:''});});
 it('shows recovery navigation without mock review tabs',()=>{const fixture=TestBed.createComponent(LoginComponent);fixture.detectChanges();expect(fixture.nativeElement.querySelector('a[href="/recuperar-acceso"]')).toBeTruthy();expect(fixture.nativeElement.querySelector('.auth-review-tabs')).toBeNull();});
});
