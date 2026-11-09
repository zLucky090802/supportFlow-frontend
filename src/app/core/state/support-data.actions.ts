import { createAction, props } from '@ngrx/store';
import { ConversationRecord, CustomerRecord, MessageRecord, UserRecord } from '../supportflow-api.service';

export const loadContacts = createAction('[Contacts] Load requested');
export const contactsLoaded = createAction('[Contacts] Loaded', props<{ customers: CustomerRecord[]; conversations: ConversationRecord[] }>());
export const contactsLoadFailed = createAction('[Contacts] Load failed', props<{ message: string }>());
export const createCustomer = createAction('[Contacts] Create requested', props<{ organizationId: string; name: string; email: string }>());
export const customerCreated = createAction('[Contacts] Created', props<{ customer: CustomerRecord }>());
export const customerCreateFailed = createAction('[Contacts] Create failed', props<{ message: string }>());

export const loadInbox = createAction('[Inbox] Load requested');
export const inboxLoaded = createAction('[Inbox] Loaded', props<{ conversations: ConversationRecord[]; customers: CustomerRecord[]; agents: UserRecord[] }>());
export const inboxLoadFailed = createAction('[Inbox] Load failed', props<{ message: string }>());
export const loadMessages = createAction('[Inbox] Load messages', props<{ conversationId: string }>());
export const messagesLoaded = createAction('[Inbox] Messages loaded', props<{ conversationId: string; messages: MessageRecord[] }>());
export const messagesLoadFailed = createAction('[Inbox] Messages load failed', props<{ conversationId: string; message: string }>());
export const startConversation = createAction('[Inbox] Create conversation', props<{ organizationId: string; customerId: string }>());
export const conversationStarted = createAction('[Inbox] Conversation created', props<{ conversation: ConversationRecord }>());
export const conversationStartFailed = createAction('[Inbox] Conversation create failed', props<{ message: string }>());
export const sendConversationMessage = createAction('[Inbox] Send message', props<{ conversationId: string; content: string }>());
export const conversationMessageSent = createAction('[Inbox] Message sent', props<{ message: MessageRecord }>());
export const conversationMessageFailed = createAction('[Inbox] Message send failed', props<{ message: string }>());
export const resolveConversation = createAction('[Inbox] Resolve conversation', props<{ conversationId: string }>());
export const conversationResolved = createAction('[Inbox] Conversation resolved', props<{ conversation: ConversationRecord }>());
export const conversationResolveFailed = createAction('[Inbox] Resolve failed', props<{ message: string }>());
export const changeConversationAssignee = createAction('[Inbox] Change assignee', props<{ conversationId: string; agentId: string }>());
export const conversationAssigneeChanged = createAction('[Inbox] Assignee changed', props<{ conversation: ConversationRecord }>());
export const conversationAssigneeChangeFailed = createAction('[Inbox] Assignee change failed', props<{ message: string }>());
