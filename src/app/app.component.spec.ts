import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { ContactsComponent } from './features/contacts/contacts.component';
import { InboxComponent } from './features/inbox/inbox.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should open the inbox by default', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', InboxComponent);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Conversaciones');
  });

  it('should combine contact filters and recover from empty results', async () => {
    const harness = await RouterTestingHarness.create();
    const contacts = await harness.navigateByUrl('/contactos', ContactsComponent);
    expect(contacts.filteredContacts().length).toBe(8);
    contacts.query.set('maria');
    contacts.channel.set('WhatsApp');
    contacts.tag.set('Cliente');
    expect(contacts.filteredContacts().map(c => c.name)).toEqual(['María González']);
    contacts.group.set('starred');
    expect(contacts.selected()?.name).toBe('María González');
    contacts.channel.set('Correo');
    harness.detectChanges();
    expect(contacts.selected()).toBeNull();
    expect(harness.routeNativeElement?.textContent).toContain('No hay contactos con estos filtros.');
    contacts.clearFilters();
    expect(contacts.filteredContacts().length).toBe(8);
  });

  it('should link the selected contact to the matching conversation', async () => {
    const harness = await RouterTestingHarness.create();
    const contacts = await harness.navigateByUrl('/contactos', ContactsComponent);
    contacts.selectedId.set(2);
    harness.detectChanges();
    const link = harness.routeNativeElement?.querySelector('.summary a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/bandeja?conversacion=2');
    const inbox = await harness.navigateByUrl(link.getAttribute('href')!, InboxComponent);
    expect(inbox.selectedConversation().name).toBe('Carlos Ramírez');
  });

  it('should not link contacts without a conversation to an unrelated chat', async () => {
    const harness = await RouterTestingHarness.create();
    const contacts = await harness.navigateByUrl('/contactos', ContactsComponent);
    contacts.selectedId.set(7);
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('.summary a')).toBeNull();
    expect(harness.routeNativeElement?.textContent).toContain('Sin conversación disponible');
  });
});
