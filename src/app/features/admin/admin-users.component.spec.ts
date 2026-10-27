import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminUsersComponent } from './admin-users.component';
describe('Global administration users',()=>{
  beforeEach(()=>TestBed.configureTestingModule({imports:[AdminUsersComponent],providers:[provideRouter([])]}));
  it('filters accents and combines filters with an empty state',()=>{
    const fixture=TestBed.createComponent(AdminUsersComponent);const page=fixture.componentInstance;page.query.set('andres');fixture.detectChanges();expect(page.filtered().length).toBe(1);page.status.set('Activo');fixture.detectChanges();expect(page.selected()).toBeNull();expect(fixture.nativeElement.querySelector('.empty').textContent).toContain('No hay personas');page.clearFilters();expect(page.filtered().length).toBe(6);
  });
  it('opens confirmations without mutation and blocks moves with pending conversations',()=>{
    const fixture=TestBed.createComponent(AdminUsersComponent);const page=fixture.componentInstance;fixture.detectChanges();const original=page.store.users();page.openAction('move');fixture.detectChanges();expect(fixture.nativeElement.querySelector('dialog').open).toBeTrue();expect(page.blocked()).toBeTrue();page.confirm();expect(page.store.users()).toBe(original);page.dialog().nativeElement.close();
  });
  it('confirms a selected user independently of filters and closes the dialog',()=>{
    const fixture=TestBed.createComponent(AdminUsersComponent);const page=fixture.componentInstance;fixture.detectChanges();page.selectedId.set(4);page.openAction('move');page.actionValue.set('success');page.query.set('camila');page.confirm();fixture.detectChanges();expect(page.store.users().find(u=>u.id===4)?.team).toBe('success');expect(page.store.users().find(u=>u.id===1)?.team).toBe('support');expect(fixture.nativeElement.querySelector('dialog').open).toBeFalse();expect(page.feedback()).toContain('Valentina');
  });
});
