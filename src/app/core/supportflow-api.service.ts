import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiEnvelope } from './auth/auth.models';

export interface CustomerRecord {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  created_at: string | null;
}

export interface ConversationRecord {
  id: string;
  organization_id: string;
  customer_id: string;
  assigned_agent_id: string | null;
  status: 'OPEN' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
  created_at: string | null;
  updated_at: string | null;
  resolved_at: string | null;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  sender_type: 'CUSTOMER' | 'AI' | 'AGENT';
  sender_id: string | null;
  content: string;
  created_at: string | null;
}

export interface UserRecord {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class SupportFlowApiService {
  private readonly http = inject(HttpClient);
  getCustomers(): Observable<CustomerRecord[]> {
    return this.http.get<ApiEnvelope<CustomerRecord[]>>('/customer').pipe(map(response => response.data));
  }
  createCustomer(organizationId: string, name: string, email: string): Observable<CustomerRecord> {
    return this.http.post<ApiEnvelope<CustomerRecord>>('/customer', {
      organization_id: organizationId, name: name.trim(), email: email.trim(),
    }).pipe(map(response => response.data));
  }
  getConversations(): Observable<ConversationRecord[]> {
    return this.http.get<ApiEnvelope<ConversationRecord[]>>('/conversations').pipe(map(response => response.data));
  }
  getUsers(): Observable<UserRecord[]> {
    return this.http.get<ApiEnvelope<UserRecord[]>>('/users').pipe(map(response => response.data));
  }
  createConversation(organizationId: string, customerId: string): Observable<ConversationRecord> {
    return this.http.post<ApiEnvelope<ConversationRecord>>('/conversations', { organization_id: organizationId, customer_id: customerId }).pipe(map(response => response.data));
  }
  getMessages(conversationId: string): Observable<MessageRecord[]> {
    return this.http.get<ApiEnvelope<MessageRecord[]>>(`/conversations/${encodeURIComponent(conversationId)}/messages`).pipe(map(response => response.data));
  }
  sendMessage(conversationId: string, content: string): Observable<MessageRecord> {
    return this.http.post<ApiEnvelope<MessageRecord>>(`/conversations/${encodeURIComponent(conversationId)}/messages`, { content }).pipe(map(response => response.data));
  }
  updateConversationStatus(conversationId: string, status: ConversationRecord['status']): Observable<ConversationRecord> {
    return this.http.patch<ApiEnvelope<ConversationRecord>>(`/conversations/${encodeURIComponent(conversationId)}`, { status }).pipe(map(response => response.data));
  }
  assignConversation(conversationId: string, agentId: string): Observable<ConversationRecord> {
    return this.http.patch<ApiEnvelope<ConversationRecord>>(`/conversations/${encodeURIComponent(conversationId)}/assign`, { agent_id: agentId }).pipe(map(response => response.data));
  }
  unassignConversation(conversationId: string): Observable<ConversationRecord> {
    return this.http.patch<ApiEnvelope<ConversationRecord>>(`/conversations/${encodeURIComponent(conversationId)}/unassign`, {}).pipe(map(response => response.data));
  }
}
