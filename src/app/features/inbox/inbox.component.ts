import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Conversation, InboxFilter } from '../../core/interfaces/conversation';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';

@Component({
  selector: 'app-inbox',
  imports: [CommonModule, FormsModule, AppIconComponent, RouterLink],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InboxComponent {
  readonly isSidebarExpanded = signal(true);
  readonly activeFilter = signal<InboxFilter>('all');
  readonly selectedConversationId = signal(1);
  readonly searchTerm = signal('');
  readonly detailsOpen = signal(true);

  readonly conversations: Conversation[] = [
    { id: 1, name: 'María González', initials: 'MG', avatarTone: 'sage', channel: 'whatsapp', preview: 'Perfecto, muchas gracias por la ayuda.', time: '2 min', unread: 3, assignedTo: 'Daniel Espitia', status: 'open', tags: ['Cuenta', 'Prioridad media'] },
    { id: 2, name: 'Carlos Ramírez', initials: 'CR', avatarTone: 'sand', channel: 'email', preview: '¿Puedo cambiar el correo de mi cuenta?', time: '8 min', unread: 1, assignedTo: null, status: 'open', tags: ['Acceso'] },
    { id: 3, name: 'Laura Martínez', initials: 'LM', avatarTone: 'lavender', channel: 'instagram', preview: 'Ya pude completar el proceso. Gracias.', time: '24 min', unread: 0, assignedTo: 'Daniel Espitia', status: 'waiting', tags: ['Onboarding'] },
    { id: 4, name: 'Andrés López', initials: 'AL', avatarTone: 'sky', channel: 'whatsapp', preview: 'El enlace de recuperación expiró.', time: '42 min', unread: 2, assignedTo: null, status: 'open', tags: ['Acceso', 'Urgente'] },
    { id: 5, name: 'Sofía Herrera', initials: 'SH', avatarTone: 'rose', channel: 'email', preview: 'Quedo atenta a la actualización del caso.', time: '1 h', unread: 0, assignedTo: 'Camila Torres', status: 'waiting', tags: ['Facturación'] },
    { id: 6, name: 'Nicolás Castro', initials: 'NC', avatarTone: 'sage', channel: 'whatsapp', preview: '¿El plan incluye soporte para mi equipo?', time: '2 h', unread: 4, assignedTo: 'Daniel Espitia', status: 'open', tags: ['Planes'] },
  ];

  readonly filteredConversations = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchTerm().trim().toLocaleLowerCase('es');
    return this.conversations.filter((conversation) => {
      const belongsToFilter = filter === 'all'
        || (filter === 'mine' && conversation.assignedTo === 'Daniel Espitia')
        || (filter === 'unassigned' && conversation.assignedTo === null);
      const matchesSearch = !query
        || conversation.name.toLocaleLowerCase('es').includes(query)
        || conversation.preview.toLocaleLowerCase('es').includes(query);
      return belongsToFilter && matchesSearch;
    });
  });

  readonly selectedConversation = computed(() =>
    this.conversations.find(({ id }) => id === this.selectedConversationId()) ?? this.conversations[0],
  );

  readonly selectedChannelLabel = computed(() => ({
    whatsapp: 'WhatsApp',
    email: 'Correo',
    instagram: 'Instagram',
  })[this.selectedConversation().channel]);

  readonly selectedEmail = computed(() => ({
    1: 'maria.gonzalez@mail.com',
    2: 'carlos.ramirez@mail.com',
    3: 'laura.martinez@mail.com',
    4: 'andres.lopez@mail.com',
    5: 'sofia.herrera@mail.com',
    6: 'nicolas.castro@mail.com',
  })[this.selectedConversation().id]);

  constructor() {
    inject(ActivatedRoute).queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const id = Number(params.get('conversacion'));
      if (this.conversations.some(conversation => conversation.id === id)) {
        this.selectedConversationId.set(id);
      }
    });
  }

  setFilter(filter: InboxFilter): void { this.activeFilter.set(filter); }
  selectConversation(id: number): void { this.selectedConversationId.set(id); }
  toggleSidebar(): void { this.isSidebarExpanded.update((expanded) => !expanded); }
  toggleDetails(): void { this.detailsOpen.update((open) => !open); }
  trackConversation(_: number, conversation: Conversation): number { return conversation.id; }
}
