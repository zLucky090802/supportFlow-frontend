import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Conversation, InboxFilter } from '../../core/interfaces/conversation';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { AppIconName } from '../../shared/components/app-icon/app-icon.component';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import { ConversationRecord, CustomerRecord, MessageRecord, SupportFlowApiService, UserRecord } from '../../core/supportflow-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';

const EMPTY_CONVERSATION: Conversation = { id: '', name: 'Selecciona una conversación', initials: '—', avatarTone: 'sage', channel: 'unknown', preview: '', time: '', unread: 0, assignedTo: null, status: 'open', tags: [] };
interface InboxMessage extends MessageRecord { timeLabel: string; senderLabel: string; isStaff: boolean; }

@Component({
  selector: 'app-inbox',
  imports: [AppSidebarComponent, CommonModule, FormsModule, AppIconComponent],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InboxComponent {
  readonly isSidebarExpanded = signal(true);
  readonly activeFilter = signal<InboxFilter>('all');
  readonly selectedConversationId = signal<string | number>('');
  readonly searchTerm = signal('');
  readonly detailsOpen = signal(true);

  readonly conversations = signal<Conversation[]>([]);
  readonly messages = signal<InboxMessage[]>([]);
  readonly loading = signal(true);
  readonly loadingMessages = signal(false);
  readonly sending = signal(false);
  readonly loadError = signal('');
  readonly messageError = signal('');
  readonly customerOptions = signal<CustomerRecord[]>([]);
  readonly agentOptions = signal<UserRecord[]>([]);
  readonly assignmentBusy = signal(false);
  readonly newCustomerId = signal('');
  readonly creatingConversation = signal(false);
  readonly createConversationError = signal('');
  readonly newConversationDialog = viewChild.required<ElementRef<HTMLDialogElement>>('newConversationDialog');
  draftMessage = '';
  private readonly api = inject(SupportFlowApiService);
  private readonly auth = inject(AuthSessionService);

  readonly filteredConversations = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchTerm().trim().toLocaleLowerCase('es');
    return this.conversations().filter((conversation) => {
      const belongsToFilter = filter === 'all'
        || (filter === 'mine' && conversation.assignedTo === this.auth.user()?.name)
        || (filter === 'unassigned' && conversation.assignedTo === null);
      const matchesSearch = !query
        || conversation.name.toLocaleLowerCase('es').includes(query)
        || conversation.preview.toLocaleLowerCase('es').includes(query);
      return belongsToFilter && matchesSearch;
    });
  });
  readonly mineCount = computed(() => this.conversations().filter(conversation => conversation.assignedTo === this.auth.user()?.name).length);
  readonly unassignedCount = computed(() => this.conversations().filter(conversation => !conversation.assignedTo).length);

  readonly selectedConversation = computed(() =>
    this.conversations().find(({ id }) => String(id) === String(this.selectedConversationId())) ?? this.conversations()[0] ?? EMPTY_CONVERSATION,
  );

  readonly selectedChannelLabel = computed(() => {
    const channel = this.selectedConversation().channel;
    return channel === 'unknown' ? 'Canal no registrado' : ({ whatsapp: 'WhatsApp', email: 'Correo', instagram: 'Instagram' })[channel];
  });

  readonly channelIcon = computed<AppIconName>(() => {
    const channel = this.selectedConversation().channel;
    return channel === 'unknown' ? 'inbox' : channel;
  });
  readonly statusLabel = computed(() => ({ open: 'Abierta', waiting: 'Escalada', resolved: 'Resuelta' })[this.selectedConversation().status]);

  readonly selectedEmail = computed(() => this.selectedConversation().email ?? 'No disponible');

  constructor() {
    inject(ActivatedRoute).queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const id = params.get('conversacion');
      if (id) this.selectConversation(id);
    });
    this.loadConversations();
    this.api.getUsers().subscribe({ next: users => this.agentOptions.set(users.filter(user => user.role === 'AGENT')), error: () => this.agentOptions.set([]) });
  }

  setFilter(filter: InboxFilter): void { this.activeFilter.set(filter); }
  selectConversation(id: string | number): void { this.selectedConversationId.set(id); this.loadMessages(String(id)); }
  loadConversations(): void {
    this.loading.set(true); this.loadError.set('');
    forkJoin({ conversations: this.api.getConversations(), customers: this.api.getCustomers().pipe(catchError(() => of([] as CustomerRecord[]))) }).subscribe({
      next: ({ conversations, customers }) => {
        this.customerOptions.set(customers);
        this.newCustomerId.set(customers[0]?.id ?? '');
        const mapped = conversations.map(item => this.toConversation(item, customers));
        this.conversations.set(mapped); this.loading.set(false);
        const requested = String(this.selectedConversationId());
        const selected = mapped.find(item => String(item.id) === requested) ?? mapped[0];
        if (selected) this.selectConversation(selected.id);
      },
      error: (error: unknown) => {
        this.loading.set(false); this.loadError.set(error instanceof HttpErrorResponse && error.status === 403
          ? 'No tienes permiso para ver estas conversaciones.'
          : 'No pudimos cargar las conversaciones. Comprueba el backend e inténtalo de nuevo.');
      },
    });
  }
  private toConversation(item: ConversationRecord, customers: CustomerRecord[]): Conversation {
    const customer = customers.find(entry => entry.id === item.customer_id);
    const name = customer?.name ?? `Cliente ${item.customer_id.slice(0, 8)}`;
    const dateValue = item.updated_at ?? item.created_at;
    const date = dateValue ? new Date(dateValue) : null;
    return { id: item.id, name, initials: name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase(), avatarTone: 'sage', channel: 'unknown', preview: 'Abre la conversación para ver el historial.', time: date && !Number.isNaN(date.getTime()) ? date.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }) : '', unread: 0, assignedTo: item.assigned_agent_id ? (item.assigned_agent_id === this.auth.user()?.id ? this.auth.user()?.name ?? 'Asignada a ti' : 'Agente asignado') : null, assignedToId: item.assigned_agent_id, status: item.status === 'RESOLVED' || item.status === 'CLOSED' ? 'resolved' : item.status === 'ESCALATED' ? 'waiting' : 'open', tags: [], email: customer?.email };
  }
  openNewConversation(): void {
    this.createConversationError.set('');
    this.newConversationDialog().nativeElement.showModal();
  }
  closeNewConversation(): void { this.newConversationDialog().nativeElement.close(); }
  changeAssignment(agentId: string): void {
    const conversationId = String(this.selectedConversation().id);
    if (!conversationId || this.assignmentBusy()) return;
    this.assignmentBusy.set(true);
    const request = agentId ? this.api.assignConversation(conversationId, agentId) : this.api.unassignConversation(conversationId);
    request.subscribe({
      next: updated => {
        const user = this.agentOptions().find(item => item.id === updated.assigned_agent_id);
        this.conversations.update(items => items.map(item => String(item.id) === conversationId ? { ...item, assignedTo: user?.name ?? (updated.assigned_agent_id ? 'Agente asignado' : null), assignedToId: updated.assigned_agent_id } : item));
        this.assignmentBusy.set(false);
      },
      error: () => this.assignmentBusy.set(false),
    });
  }
  createConversation(): void {
    const user = this.auth.user(); const customerId = this.newCustomerId();
    if (!user || !customerId || this.creatingConversation()) return;
    this.creatingConversation.set(true); this.createConversationError.set('');
    this.api.createConversation(user.organization_id, customerId).subscribe({
      next: conversation => {
        const mapped = this.toConversation(conversation, this.customerOptions());
        this.conversations.update(items => [mapped, ...items]); this.selectConversation(mapped.id);
        this.creatingConversation.set(false); this.newConversationDialog().nativeElement.close();
      },
      error: (cause: unknown) => {
        this.creatingConversation.set(false);
        this.createConversationError.set(cause instanceof HttpErrorResponse && cause.status === 403 ? 'Tu rol no tiene permiso para iniciar conversaciones.' : 'No se pudo crear la conversación. Verifica el cliente y vuelve a intentarlo.');
      },
    });
  }
  private loadMessages(id: string): void {
    if (!id) { this.messages.set([]); return; }
    this.loadingMessages.set(true); this.messageError.set('');
    this.api.getMessages(id).subscribe({
      next: items => {
        this.messages.set(items.map(item => ({ ...item, timeLabel: item.created_at ? new Date(item.created_at).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }) : '', senderLabel: item.sender_type === 'AI' ? 'Asistente de IA' : item.sender_type === 'AGENT' ? 'Agente' : this.selectedConversation().name, isStaff: item.sender_type !== 'CUSTOMER' })));
        const last = items.at(-1);
        if (last) this.conversations.update(list => list.map(item => String(item.id) === id ? { ...item, preview: last.content } : item));
        this.loadingMessages.set(false);
      },
      error: () => { this.loadingMessages.set(false); this.messageError.set('No se pudo cargar el historial de esta conversación.'); },
    });
  }
  sendMessage(): void {
    const id = String(this.selectedConversation().id); const content = this.draftMessage.trim();
    if (!content || !id || this.sending()) return;
    this.sending.set(true); this.messageError.set('');
    this.api.sendMessage(id, content).subscribe({
      next: message => { this.messages.update(items => [...items, { ...message, timeLabel: message.created_at ? new Date(message.created_at).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }) : '', senderLabel: 'Tú', isStaff: true }]); this.conversations.update(items => items.map(item => String(item.id) === id ? { ...item, preview: message.content } : item)); this.draftMessage = ''; this.sending.set(false); },
      error: (cause: unknown) => { this.sending.set(false); this.messageError.set(cause instanceof HttpErrorResponse && cause.status === 403 ? 'No tienes permiso para responder esta conversación.' : 'No se pudo enviar la respuesta. Inténtalo de nuevo.'); },
    });
  }
  resolveConversation(): void {
    const id = String(this.selectedConversation().id); if (!id) return;
    this.api.updateConversationStatus(id, 'RESOLVED').subscribe({
      next: updated => this.conversations.update(items => items.map(item => String(item.id) === id ? { ...item, status: updated.status === 'RESOLVED' || updated.status === 'CLOSED' ? 'resolved' : updated.status === 'ESCALATED' ? 'waiting' : 'open' } : item)),
      error: () => this.messageError.set('No se pudo actualizar el estado de la conversación.'),
    });
  }
  toggleSidebar(): void { this.isSidebarExpanded.update((expanded) => !expanded); }
  toggleDetails(): void { this.detailsOpen.update((open) => !open); }
  trackConversation(_: number, conversation: Conversation): string | number { return conversation.id; }
}
