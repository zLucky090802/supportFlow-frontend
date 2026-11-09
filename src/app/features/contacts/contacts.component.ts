import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { Contact } from './contacts.data';
import { ContactDraft, parseContactsCsv } from './contacts.store';
import { HttpErrorResponse } from '@angular/common/http';
import { SupportFlowApiService, CustomerRecord, ConversationRecord } from '../../core/supportflow-api.service';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthSessionService } from '../../core/auth/auth-session.service';

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
  readonly api = inject(SupportFlowApiService);
  private readonly auth = inject(AuthSessionService);
  readonly contacts = signal<Contact[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly notice = signal('');
  readonly error = signal('');
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

  constructor() { this.load(); }

  load(): void {
    this.loading.set(true); this.loadError.set('');
    forkJoin({ customers: this.api.getCustomers(), conversations: this.api.getConversations().pipe(catchError(() => of([]))) }).subscribe({
      next: ({ customers, conversations }) => {
        this.contacts.set(customers.map((customer, index) => this.toContact(customer, conversations, index + 1)));
        this.selectedId.set(customers.length ? 1 : 0); this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.loadError.set(error instanceof HttpErrorResponse && error.status === 403
          ? 'Tu rol no tiene permiso para consultar la lista de clientes.'
          : 'No pudimos cargar los clientes. Comprueba el backend e inténtalo de nuevo.');
      },
    });
  }

  private toContact(customer: CustomerRecord, conversations: ConversationRecord[] = [], localId = 0): Contact {
    const name = customer.name.trim();
    const created = customer.created_at ? new Date(customer.created_at) : null;
    const validCreated = created && !Number.isNaN(created.getTime());
    const time = validCreated ? created.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : 'Fecha no disponible';
    const recent = !!validCreated && Date.now() - created.getTime() <= 30 * 86400000;
    return {
      id: localId || Math.max(0, ...this.contacts().map(contact => contact.id)) + 1, apiId: customer.id, name, email: customer.email, initials: name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase(),
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
    this.preview.set([]); this.error.set('');
    this.draft = { name: '', email: '', channel: 'WhatsApp', tag: 'Cliente' };
    dialog.showModal();
  }

  cancelRead(): void { this.fileVersion++; this.reading.set(false); }

  async readCsv(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const version = ++this.fileVersion;
    this.preview.set([]); this.error.set(''); this.reading.set(false);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv') || file.size > 1024 * 1024) {
      this.error.set('Selecciona un archivo CSV de hasta 1 MB.'); input.value = ''; return;
    }
    this.reading.set(true);
    try {
      const text = await file.text();
      if (version !== this.fileVersion) return;
      this.preview.set(parseContactsCsv(text));
    } catch (error) {
      if (version === this.fileVersion) this.error.set(error instanceof Error ? error.message : 'No se pudo leer el archivo.');
    } finally {
      if (version === this.fileVersion) this.reading.set(false);
      input.value = '';
    }
  }

  save(dialog: HTMLDialogElement): void {
    this.error.set('');
    if (this.reading() || this.importing()) { this.error.set('La API todavía no tiene una ruta para importar CSV.'); return; }
    const user = this.auth.user();
    if (!user) { this.error.set('Inicia sesión para crear un cliente.'); return; }
    this.api.createCustomer(user.organization_id, this.draft.name, this.draft.email).subscribe({
      next: customer => {
        const contact = this.toContact(customer);
        this.contacts.update(items => [...items, contact]); this.clearFilters(); this.selectedId.set(contact.id);
        this.notice.set('Cliente creado en Support Flow.'); dialog.close();
      },
      error: (cause: unknown) => {
        const status = cause instanceof HttpErrorResponse ? cause.status : 0;
        this.error.set(status === 409 ? 'Ya existe un cliente con ese correo.' : status === 403 ? 'Tu rol no tiene permiso para crear clientes.' : 'No se pudo crear el cliente. Comprueba los datos e inténtalo de nuevo.');
      },
    });
  }
}
