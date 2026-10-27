import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConnectionsComponent } from './connections.component';

describe('Connections demo', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [ConnectionsComponent], providers: [provideRouter([])] }));
  const create = () => { const fixture = TestBed.createComponent(ConnectionsComponent); fixture.detectChanges(); return fixture; };
  it('requires an account and a nonblank label before linking', () => {
    const component = create().componentInstance; component.start('Correo'); component.step.set('account');
    component.connect(); expect(component.step()).toBe('account'); expect(component.activeCount()).toBe(1);
    component.account = 'primary'; component.channelName = '   '; component.connect();
    expect(component.accountError()).not.toBe(''); expect(component.activeCount()).toBe(1);
  });
  it('retains both account options after reconnecting a secondary account', () => {
    const component = create().componentInstance; component.start('Correo'); component.account = 'secondary'; component.channelName = 'Ventas'; component.connect();
    expect(component.selected().account).toBe('ventas@supportflow.demo'); expect(component.activeCount()).toBe(2);
    component.start('Correo'); expect(component.selected().primary).toBe('soporte@supportflow.demo');
    component.account = 'primary'; component.connect(); expect(component.selected().account).toBe('soporte@supportflow.demo');
  });
  it('does not alter connections on errors or cancellation', () => {
    const component = create().componentInstance; const original = component.links(); component.start('Instagram');
    for (const kind of ['authorization', 'cancel', 'accounts'] as const) { component.error(kind); expect(component.step()).toBe('error'); expect(component.links()).toEqual(original); }
    component.cancel(); expect(component.step()).toBe('overview'); expect(component.links()).toEqual(original);
  });
  it('requires confirmation to disconnect and restores data in a new instance', () => {
    const fixture = create(); const root: HTMLElement = fixture.nativeElement;
    root.querySelector<HTMLButtonElement>('.channel-foot button')!.click(); fixture.detectChanges();
    expect(root.querySelector<HTMLDialogElement>('#detail-dialog')!.open).toBeTrue();
    root.querySelector<HTMLButtonElement>('#request-disconnect')!.click(); fixture.detectChanges();
    expect(fixture.componentInstance.activeCount()).toBe(1);
    root.querySelector<HTMLButtonElement>('#confirm-disconnect')!.click(); fixture.detectChanges();
    expect(fixture.componentInstance.activeCount()).toBe(0);
    expect(create().componentInstance.activeCount()).toBe(1);
  });
});
