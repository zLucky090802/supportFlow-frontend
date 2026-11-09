import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Conversation, InboxFilter } from '../../core/interfaces/conversation';
import { AuthUser } from '../../core/auth/auth.models';
import { selectCurrentUser } from '../../core/auth/auth.selectors';
import { ConversationRecord, CustomerRecord, MessageRecord, UserRecord } from '../../core/supportflow-api.service';
import { conversationStarted, inboxLoaded, loadInbox, loadMessages, sendConversationMessage, resolveConversation, changeConversationAssignee, startConversation } from '../../core/state/support-data.actions';
import { selectAgents, selectConversationCreateError, selectConversationCreating, selectConversationCustomers, selectConversationPreviews, selectConversationUpdateError, selectConversations, selectInboxError, selectInboxLoading, selectMessageSendError, selectMessageSending, selectMessages, selectMessagesError, selectMessagesLoading, selectConversationUpdating } from '../../core/state/support-data.selectors';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AppIconComponent, AppIconName } from '../../shared/components/app-icon/app-icon.component';

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
  private readonly store = inject(Store);
  private readonly actions = inject(Actions);
  readonly isSidebarExpanded = signal(true);
  readonly activeFilter = signal<InboxFilter>('all');
  readonly selectedConversationId = signal<string | number>('');
  readonly searchTerm = signal('');
  readonly detailsOpen = signal(true);
  readonly user = this.store.selectSignal(selectCurrentUser);
  readonly customerRecords = this.store.selectSignal(selectConversationCustomers);
  readonly customerOptions = this.customerRecords;
  readonly agentOptions = this.store.selectSignal(selectAgents);
  readonly rawConversations = this.store.selectSignal(selectConversations);
  readonly previews = this.store.selectSignal(selectConversationPreviews);
  readonly conversations = computed(() => this.rawConversations().map(item => this.toConversation(item, this.customerRecords(), this.agentOptions(), this.user(), this.previews()[item.id])));
  readonly rawMessages = this.store.selectSignal(selectMessages);
  readonly messages = computed<InboxMessage[]>(() => this.rawMessages().map(item => ({
    ...item,
    timeLabel: item.created_at ? new Date(item.created_at).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }) : '',
    senderLabel: item.sender_type === 'AI' ? 'Asistente de IA' : item.sender_type === 'AGENT' ? (item.sender_id === this.user()?.id ? 'Tú' : 'Agente') : this.selectedConversation().name,
    isStaff: item.sender_type !== 'CUSTOMER',
  })));
  readonly loading = this.store.selectSignal(selectInboxLoading);
  readonly loadingMessages = this.store.selectSignal(selectMessagesLoading);
  readonly sending = this.store.selectSignal(selectMessageSending);
  readonly assignmentBusy = this.store.selectSignal(selectConversationUpdating);
  readonly creatingConversation = this.store.selectSignal(selectConversationCreating);
  readonly loadError = this.store.selectSignal(selectInboxError);
  readonly createConversationError = this.store.selectSignal(selectConversationCreateError);
  private readonly messageLoadError = this.store.selectSignal(selectMessagesError);
  private readonly messageSendError = this.store.selectSignal(selectMessageSendError);
  private readonly conversationUpdateError = this.store.selectSignal(selectConversationUpdateError);
  readonly messageError = computed(() => this.messageLoadError() || this.messageSendError() || this.conversationUpdateError() || '');
  readonly newCustomerId = signal('');
  readonly newConversationDialog = viewChild.required<ElementRef<HTMLDialogElement>>('newConversationDialog');
  draftMessage = '';

  readonly filteredConversations = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchTerm().trim().toLocaleLowerCase('es');
    return this.conversations().filter(conversation => {
      const belongsToFilter = filter === 'all'
        || (filter === 'mine' && conversation.assignedToId === this.user()?.id)
        || (filter === 'unassigned' && conversation.assignedToId == null);
      const matchesSearch = !query || conversation.name.toLocaleLowerCase('es').includes(query) || conversation.preview.toLocaleLowerCase('es').includes(query);
      return belongsToFilter && matchesSearch;
    });
  });
  readonly mineCount = computed(() => this.conversations().filter(conversation => conversation.assignedToId === this.user()?.id).length);
  readonly unassignedCount = computed(() => this.conversations().filter(conversation => conversation.assignedToId == null).length);
  readonly selectedConversation = computed(() => this.conversations().find(({ id }) => String(id) === String(this.selectedConversationId())) ?? this.conversations()[0] ?? EMPTY_CONVERSATION);
  readonly selectedChannelLabel = computed(() => {
    const channel = this.selectedConversation().channel;
    return channel === 'unknown' ? 'Canal no registrado' : ({ whatsapp: 'WhatsApp', email: 'Correo', instagram: 'Instagram' })[channel];
  });
  readonly channelIcon = computed<AppIconName>(() => {
    const channel = this.selectedConversation().channel;
    return channel === 'unknown' ? 'inbox' : channel as AppIconName;
  });
  readonly statusLabel = computed(() => ({ open: 'Abierta', waiting: 'Escalada', resolved: 'Resuelta' })[this.selectedConversation().status]);
  readonly selectedEmail = computed(() => this.selectedConversation().email ?? 'No disponible');

  constructor() {
    inject(ActivatedRoute).queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const id = params.get('conversacion');
      if (id) this.selectConversation(id);
    });
    this.actions.pipe(ofType(inboxLoaded), takeUntilDestroyed()).subscribe(({ conversations, customers }) => {
      this.newCustomerId.set(customers[0]?.id ?? '');
      const selected = conversations.find(item => String(item.id) === String(this.selectedConversationId())) ?? conversations[0];
      if (selected) this.selectConversation(selected.id);
    });
    this.actions.pipe(ofType(conversationStarted), takeUntilDestroyed()).subscribe(({ conversation }) => {
      this.selectConversation(conversation.id);
      this.closeNewConversation();
    });
    this.store.dispatch(loadInbox());
  }

  setFilter(filter: InboxFilter): void { this.activeFilter.set(filter); }
  selectConversation(id: string | number): void {
    this.selectedConversationId.set(id);
    this.store.dispatch(loadMessages({ conversationId: String(id) }));
  }
  loadConversations(): void { this.store.dispatch(loadInbox()); }
  private toConversation(item: ConversationRecord, customers: CustomerRecord[], agents: UserRecord[], user: AuthUser | null, preview?: string): Conversation {
    const customer = customers.find(entry => entry.id === item.customer_id);
    const name = customer?.name ?? `Cliente ${item.customer_id.slice(0, 8)}`;
    const dateValue = item.updated_at ?? item.created_at;
    const date = dateValue ? new Date(dateValue) : null;
    const assigned = agents.find(agent => agent.id === item.assigned_agent_id);
    return {
      id: item.id, name, initials: name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase(),
      avatarTone: 'sage', channel: 'unknown', preview: preview ?? 'Abre la conversación para ver el historial.',
      time: date && !Number.isNaN(date.getTime()) ? date.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }) : '',
      unread: 0, assignedTo: item.assigned_agent_id ? assigned?.name ?? (item.assigned_agent_id === user?.id ? user.name : 'Agente asignado') : null,
      assignedToId: item.assigned_agent_id, status: item.status === 'RESOLVED' || item.status === 'CLOSED' ? 'resolved' : item.status === 'ESCALATED' ? 'waiting' : 'open', tags: [], email: customer?.email,
    };
  }
  openNewConversation(): void { this.newConversationDialog().nativeElement.showModal(); }
  closeNewConversation(): void { this.newConversationDialog().nativeElement.close(); }
  changeAssignment(agentId: string): void {
    const conversationId = String(this.selectedConversation().id);
    if (conversationId) this.store.dispatch(changeConversationAssignee({ conversationId, agentId }));
  }
  createConversation(): void {
    const user = this.user(); const customerId = this.newCustomerId();
    if (user && customerId) this.store.dispatch(startConversation({ organizationId: user.organization_id, customerId }));
  }
  sendMessage(): void {
    const conversationId = String(this.selectedConversation().id); const content = this.draftMessage.trim();
    if (!content || !conversationId || this.sending()) return;
    this.store.dispatch(sendConversationMessage({ conversationId, content }));
    this.draftMessage = '';
  }
  resolveConversation(): void {
    const conversationId = String(this.selectedConversation().id);
    if (conversationId) this.store.dispatch(resolveConversation({ conversationId }));
  }
  toggleSidebar(): void { this.isSidebarExpanded.update(expanded => !expanded); }
  toggleDetails(): void { this.detailsOpen.update(open => !open); }
  trackConversation(_: number, conversation: Conversation): string | number { return conversation.id; }
}
