import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AcceptInvitationComponent } from './accept-invitation.component';
describe('Invitation acceptance demonstration',()=>{
 beforeEach(()=>TestBed.configureTestingModule({imports:[AcceptInvitationComponent],providers:[provideRouter([])]}));
 it('rejects whitespace-only and overlong names before showing simulated acceptance',()=>{const page=TestBed.createComponent(AcceptInvitationComponent).componentInstance;for(const name of ['   ','a'.repeat(81)]){page.form.setValue({name});page.submit();expect(page.done()).toBeFalse();}page.form.setValue({name:'Daniel'});page.submit();expect(page.done()).toBeTrue();});
});
