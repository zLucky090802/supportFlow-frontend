import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SwitchTeamComponent } from './switch-team.component';
describe('Switch active team',()=>{
  beforeEach(()=>TestBed.configureTestingModule({imports:[SwitchTeamComponent],providers:[provideRouter([])]}));
  it('switches context through a keyboard-accessible button without changing membership',()=>{
    const fixture=TestBed.createComponent(SwitchTeamComponent);const page=fixture.componentInstance;fixture.detectChanges();const original=page.store.users();const buttons=fixture.nativeElement.querySelectorAll('.switch-row') as NodeListOf<HTMLButtonElement>;buttons[1].click();fixture.detectChanges();expect(buttons[1].getAttribute('aria-pressed')).toBe('true');expect(buttons[0].getAttribute('aria-pressed')).toBe('false');expect(page.store.activeTeamId()).toBe('sales');expect(page.store.users()).toBe(original);expect(page.feedback()).toContain('Ninguna persona fue trasladada');
  });
});
