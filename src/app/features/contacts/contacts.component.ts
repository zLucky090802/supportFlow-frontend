import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { Contact } from './contacts.data';
import { ContactDraft, ContactsStore, parseContactsCsv } from './contacts.store';

type ContactGroup = 'all' | 'recent' | 'starred';
const normalize = (text: string): string => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

@Component({
  selector: 'app-contacts',
  imports: [FormsModule, RouterLink, AppIconComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsComponent {
  readonly store = inject(ContactsStore);
  readonly contacts = this.store.contacts;
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
    if (this.reading() || (this.importing() && !this.preview().length)) return;
    try {
      const result = this.store.add(this.importing() ? this.preview() : [this.draft]);
      if (!this.importing() && !result.added) { this.error.set('Ya existe un contacto con este correo.'); return; }
      this.clearFilters();
      if (result.firstId) this.selectedId.set(result.firstId);
      this.notice.set(`${result.added} contacto(s) guardados en este navegador.${result.duplicates ? ` ${result.duplicates} duplicado(s) omitidos por correo.` : ''}`);
      dialog.close();
    } catch (error) { this.error.set(error instanceof Error ? error.message : 'No se pudieron guardar los contactos.'); }
  }
}
