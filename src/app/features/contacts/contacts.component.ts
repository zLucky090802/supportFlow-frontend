import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { Contact, CONTACTS } from './contacts.data';

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
  readonly contacts = CONTACTS;
  readonly compact = signal(false);
  readonly group = signal<ContactGroup>('all');
  readonly query = signal('');
  readonly channel = signal('');
  readonly tag = signal('');
  readonly selectedId = signal(1);
  readonly groups = [
    { id: 'all' as const, label: 'Todos', count: CONTACTS.length },
    { id: 'recent' as const, label: 'Recientes', count: CONTACTS.filter(c => c.recent).length },
    { id: 'starred' as const, label: 'Destacados', count: CONTACTS.filter(c => c.starred).length },
  ];
  readonly filteredContacts = computed(() => {
    const query = normalize(this.query().trim());
    const group = this.group();
    return this.contacts.filter(c => (group === 'all' || c[group])
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
}
