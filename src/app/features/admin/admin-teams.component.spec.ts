import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminTeamsComponent } from './admin-teams.component';
describe('Administration team editor',()=>{
  beforeEach(()=>TestBed.configureTestingModule({imports:[AdminTeamsComponent],providers:[provideRouter([])]}));
  it('keeps invalid or duplicate names in the dialog and saves a valid team without moving users',()=>{
    const fixture=TestBed.createComponent(AdminTeamsComponent);const page=fixture.componentInstance;fixture.detectChanges();const original=page.store.users();page.open();page.form.controls.name.setValue('  ');page.save();expect(page.error()).toBeTruthy();expect(page.dialog().nativeElement.open).toBeTrue();page.form.controls.name.setValue('comercial');page.save();expect(page.error()).toContain('Ya existe');page.form.controls.name.setValue('Posventa');page.save();fixture.detectChanges();expect(page.dialog().nativeElement.open).toBeFalse();expect(page.store.teams().length).toBe(4);expect(page.store.users()).toBe(original);expect(fixture.nativeElement.querySelectorAll('.team-card').length).toBe(4);
  });
});
