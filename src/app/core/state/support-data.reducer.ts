import { createReducer, on } from '@ngrx/store';
import { ConversationRecord, CustomerRecord, MessageRecord, UserRecord } from '../supportflow-api.service';
import { logoutCompleted, logoutRequested, sessionExpired } from '../auth/auth.actions';
import * as A from './support-data.actions';

export interface SupportDataState {
  customers: CustomerRecord[]; contactConversations: ConversationRecord[]; contactsLoading: boolean; contactsError: string | null;
  customerCreating: boolean; customerCreateError: string | null;
  conversations: ConversationRecord[]; conversationCustomers: CustomerRecord[]; agents: UserRecord[]; inboxLoading: boolean; inboxError: string | null;
  messages: MessageRecord[]; messagesForConversation: string | null; messagesLoading: boolean; messagesError: string | null;
  conversationPreviews: Record<string, string>;
  conversationCreating: boolean; conversationCreateError: string | null; messageSending: boolean; messageSendError: string | null;
  conversationUpdating: boolean; conversationUpdateError: string | null;
}

export const initialSupportDataState: SupportDataState = {
  customers: [], contactConversations: [], contactsLoading: false, contactsError: null,
  customerCreating: false, customerCreateError: null,
  conversations: [], conversationCustomers: [], agents: [], inboxLoading: false, inboxError: null,
  messages: [], messagesForConversation: null, messagesLoading: false, messagesError: null,
  conversationPreviews: {},
  conversationCreating: false, conversationCreateError: null, messageSending: false, messageSendError: null,
  conversationUpdating: false, conversationUpdateError: null,
};

export const supportDataReducer = createReducer(
  initialSupportDataState,
  on(logoutRequested, logoutCompleted, sessionExpired, () => initialSupportDataState),
  on(A.loadContacts, state => ({ ...state, contactsLoading: true, contactsError: null })),
  on(A.contactsLoaded, (state, { customers, conversations }) => ({ ...state, customers, contactConversations: conversations, contactsLoading: false })),
  on(A.contactsLoadFailed, (state, { message }) => ({ ...state, contactsLoading: false, contactsError: message })),
  on(A.createCustomer, state => ({ ...state, customerCreating: true, customerCreateError: null })),
  on(A.customerCreated, (state, { customer }) => ({ ...state, customers: [...state.customers, customer], customerCreating: false })),
  on(A.customerCreateFailed, (state, { message }) => ({ ...state, customerCreating: false, customerCreateError: message })),
  on(A.loadInbox, state => ({ ...state, inboxLoading: true, inboxError: null })),
  on(A.inboxLoaded, (state, { conversations, customers, agents }) => ({ ...state, conversations, conversationCustomers: customers, agents: agents.filter(user => user.role === 'AGENT'), inboxLoading: false })),
  on(A.inboxLoadFailed, (state, { message }) => ({ ...state, inboxLoading: false, inboxError: message })),
  on(A.loadMessages, (state, { conversationId }) => ({ ...state, messages: [], messagesForConversation: conversationId, messagesLoading: true, messagesError: null })),
  on(A.messagesLoaded, (state, { conversationId, messages }) => conversationId === state.messagesForConversation ? ({ ...state, messages, messagesLoading: false, conversationPreviews: messages.length ? { ...state.conversationPreviews, [conversationId]: messages[messages.length - 1].content } : state.conversationPreviews }) : state),
  on(A.messagesLoadFailed, (state, { conversationId, message }) => conversationId === state.messagesForConversation ? ({ ...state, messagesLoading: false, messagesError: message }) : state),
  on(A.startConversation, state => ({ ...state, conversationCreating: true, conversationCreateError: null })),
  on(A.conversationStarted, (state, { conversation }) => ({ ...state, conversations: [conversation, ...state.conversations], conversationCreating: false })),
  on(A.conversationStartFailed, (state, { message }) => ({ ...state, conversationCreating: false, conversationCreateError: message })),
  on(A.sendConversationMessage, state => ({ ...state, messageSending: true, messageSendError: null })),
  on(A.conversationMessageSent, (state, { message }) => ({ ...state, messages: state.messagesForConversation === message.conversation_id ? [...state.messages, message] : state.messages, messageSending: false, conversationPreviews: { ...state.conversationPreviews, [message.conversation_id]: message.content } })),
  on(A.conversationMessageFailed, (state, { message }) => ({ ...state, messageSending: false, messageSendError: message })),
  on(A.resolveConversation, state => ({ ...state, conversationUpdating: true, conversationUpdateError: null })),
  on(A.changeConversationAssignee, state => ({ ...state, conversationUpdating: true, conversationUpdateError: null })),
  on(A.conversationResolved, (state, { conversation }) => ({ ...state, conversations: state.conversations.map(item => item.id === conversation.id ? conversation : item), conversationUpdating: false })),
  on(A.conversationAssigneeChanged, (state, { conversation }) => ({ ...state, conversations: state.conversations.map(item => item.id === conversation.id ? conversation : item), conversationUpdating: false })),
  on(A.conversationResolveFailed, (state, { message }) => ({ ...state, conversationUpdating: false, conversationUpdateError: message })),
  on(A.conversationAssigneeChangeFailed, (state, { message }) => ({ ...state, conversationUpdating: false, conversationUpdateError: message })),
);
