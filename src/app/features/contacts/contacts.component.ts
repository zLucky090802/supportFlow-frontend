import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { Contact } from './contacts.data';
import { ContactDraft, parseContactsCsv } from './contacts.store';
import { CustomerRecord, ConversationRecord } from '../../core/supportflow-api.service';
import { selectCurrentUser } from '../../core/auth/auth.selectors';
import { createCustomer, customerCreated, loadContacts } from '../../core/state/support-data.actions';
import { selectContactConversations, selectContactsError, selectContactsLoading, selectCustomerCreateError, selectCustomerCreating, selectCustomers } from '../../core/state/support-data.selectors';

type ContactGroup = 'all' | 'recent' | 'starred';
const normalize = (text: string): string => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

@Component({
  selector: 'app-contacts',
  imports: [AppSidebarComponent, FormsModule, RouterLink, AppIconComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsComponent {
  private readonly store = inject(Store);
  private readonly actions = inject(Actions);
  readonly customerRecords = this.store.selectSignal(selectCustomers);
  readonly conversationRecords = this.store.selectSignal(selectContactConversations);
  readonly contacts = computed(() => this.customerRecords().map((customer, index) => this.toContact(customer, this.conversationRecords(), index + 1)));
  readonly loading = this.store.selectSignal(selectContactsLoading);
  readonly loadError = this.store.selectSignal(selectContactsError);
  readonly saving = this.store.selectSignal(selectCustomerCreating);
  readonly saveError = this.store.selectSignal(selectCustomerCreateError);
  readonly user = this.store.selectSignal(selectCurrentUser);
  readonly notice = signal('');
  readonly formError = signal('');
  readonly error = computed(() => this.formError() || this.saveError() || '');
  readonly importing = signal(false);
  readonly preview = signal<ContactDraft[]>([]);
  readonly reading = signal(false);
  draft: ContactDraft = { name: '', email: '', channel: 'WhatsApp', tag: 'Cliente' };
  private fileVersion = 0;
  readonly compact = signal(false);
  readonly group = signal<ContactGroup>('all');
  readonly query = signal('');
  readonly channel = signal('');
  readonly tag = signal('');
  readonly selectedId = signal(1);
  readonly editorDialog = viewChild.required<ElementRef<HTMLDialogElement>>('editor');
  readonly groups = computed(() => [
    { id: 'all' as const, label: 'Todos', count: this.contacts().length },
    { id: 'recent' as const, label: 'Recientes', count: this.contacts().filter(c => c.recent).length },
    { id: 'starred' as const, label: 'Destacados', count: this.contacts().filter(c => c.starred).length },
  ]);
  readonly filteredContacts = computed(() => {
    const query = normalize(this.query().trim());
    const group = this.group();
    return this.contacts().filter(c => (group === 'all' || c[group])
      && (!query || normalize(c.name + ' ' + c.email).includes(query))
      && (!this.channel() || c.channel === this.channel())
      && (!this.tag() || c.tag === this.tag()));
  });
  readonly selected = computed<Contact | null>(() => {
    const contacts = this.filteredContacts();
    return contacts.find(c => c.id === this.selectedId()) ?? contacts[0] ?? null;
  });

  constructor() {
    this.load();
    this.actions.pipe(ofType(customerCreated), takeUntilDestroyed()).subscribe(({ customer }) => {
      const contact = this.toContact(customer);
      this.clearFilters(); this.selectedId.set(contact.id); this.notice.set('Cliente creado en Support Flow.');
      this.editorDialog().nativeElement.close();
    });
  }

  load(): void {
    this.store.dispatch(loadContacts());
  }

  private toContact(customer: CustomerRecord, conversations: ConversationRecord[] = [], localId = 0): Contact {
    const name = customer.name.trim();
    const created = customer.created_at ? new Date(customer.created_at) : null;
    const validCreated = created && !Number.isNaN(created.getTime());
    const time = validCreated ? created.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : 'Fecha no disponible';
    const recent = !!validCreated && Date.now() - created.getTime() <= 30 * 86400000;
    return {
      id: localId || Math.max(0, this.customerRecords().findIndex(item => item.id === customer.id) + 1), apiId: customer.id, name, email: customer.email, initials: name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase(),
      channel: 'No disponible', tag: 'No disponible', time, owner: 'No disponible', tone: '#dce9df', recent,
      conversationId: conversations.find(item => item.customer_id === customer.id)?.id,
      since: validCreated ? `Cliente desde ${time}` : 'Cliente registrado', note: 'Canales, etiquetas y notas no están incluidos en el API de clientes.',
    };
  }

  clearFilters(): void {
    this.query.set(''); this.channel.set(''); this.tag.set(''); this.group.set('all');
  }

  openDialog(dialog: HTMLDialogElement, importing: boolean): void {
    this.fileVersion++; this.reading.set(false); this.importing.set(importing);
    this.preview.set([]); this.formError.set('');
    this.draft = { name: '', email: '', channel: 'WhatsApp', tag: 'Cliente' };
    dialog.showModal();
  }

  cancelRead(): void { this.fileVersion++; this.reading.set(false); }

  async readCsv(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const version = ++this.fileVersion;
    this.preview.set([]); this.formError.set(''); this.reading.set(false);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv') || file.size > 1024 * 1024) {
      this.formError.set('Selecciona un archivo CSV de hasta 1 MB.'); input.value = ''; return;
    }
    this.reading.set(true);
    try {
      const text = await file.text();
      if (version !== this.fileVersion) return;
      this.preview.set(parseContactsCsv(text));
    } catch (error) {
      if (version === this.fileVersion) this.formError.set(error instanceof Error ? error.message : 'No se pudo leer el archivo.');
    } finally {
      if (version === this.fileVersion) this.reading.set(false);
      input.value = '';
    }
  }

  save(): void {
    this.formError.set('');
    if (this.reading() || this.importing()) { this.formError.set('La API todavía no tiene una ruta para importar CSV.'); return; }
    const user = this.user();
    if (!user) { this.formError.set('Inicia sesión para crear un cliente.'); return; }
    this.store.dispatch(createCustomer({ organizationId: user.organization_id, name: this.draft.name, email: this.draft.email }));
  }
}
