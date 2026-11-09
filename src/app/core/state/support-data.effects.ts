import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { SupportFlowApiService } from '../supportflow-api.service';
import * as A from './support-data.actions';

const explain = (error: unknown, fallback: string) => error instanceof HttpErrorResponse && error.status === 403
  ? 'Tu rol no tiene permiso para realizar esta acción.' : fallback;

@Injectable()
export class SupportDataEffects {
  private readonly actions = inject(Actions);
  private readonly api = inject(SupportFlowApiService);

  loadContacts$ = createEffect(() => this.actions.pipe(
    ofType(A.loadContacts),
    switchMap(() => forkJoin({
      customers: this.api.getCustomers(),
      conversations: this.api.getConversations().pipe(catchError(() => of([]))),
    }).pipe(
      map(result => A.contactsLoaded(result)),
      catchError(error => of(A.contactsLoadFailed({ message: explain(error, 'No pudimos cargar los clientes. Comprueba el backend e inténtalo de nuevo.') }))),
    )),
  ));

  createCustomer$ = createEffect(() => this.actions.pipe(
    ofType(A.createCustomer),
    switchMap(({ organizationId, name, email }) => this.api.createCustomer(organizationId, name, email).pipe(
      map(customer => A.customerCreated({ customer })),
      catchError(error => of(A.customerCreateFailed({ message: error instanceof HttpErrorResponse && error.status === 409 ? 'Ya existe un cliente con ese correo.' : explain(error, 'No se pudo crear el cliente. Comprueba los datos e inténtalo de nuevo.') }))),
    )),
  ));

  loadInbox$ = createEffect(() => this.actions.pipe(
    ofType(A.loadInbox),
    switchMap(() => forkJoin({
      conversations: this.api.getConversations(),
      customers: this.api.getCustomers().pipe(catchError(() => of([]))),
      agents: this.api.getUsers().pipe(catchError(() => of([]))),
    }).pipe(
      map(result => A.inboxLoaded(result)),
      catchError(error => of(A.inboxLoadFailed({ message: explain(error, 'No pudimos cargar las conversaciones. Comprueba el backend e inténtalo de nuevo.') }))),
    )),
  ));

  loadMessages$ = createEffect(() => this.actions.pipe(
    ofType(A.loadMessages),
    switchMap(({ conversationId }) => this.api.getMessages(conversationId).pipe(
      map(messages => A.messagesLoaded({ conversationId, messages })),
      catchError(() => of(A.messagesLoadFailed({ conversationId, message: 'No se pudo cargar el historial de esta conversación.' }))),
    )),
  ));

  startConversation$ = createEffect(() => this.actions.pipe(
    ofType(A.startConversation),
    switchMap(({ organizationId, customerId }) => this.api.createConversation(organizationId, customerId).pipe(
      map(conversation => A.conversationStarted({ conversation })),
      catchError(error => of(A.conversationStartFailed({ message: explain(error, 'No se pudo crear la conversación. Verifica el cliente e inténtalo de nuevo.') }))),
    )),
  ));

  sendMessage$ = createEffect(() => this.actions.pipe(
    ofType(A.sendConversationMessage),
    switchMap(({ conversationId, content }) => this.api.sendMessage(conversationId, content).pipe(
      map(message => A.conversationMessageSent({ message })),
      catchError(error => of(A.conversationMessageFailed({ message: explain(error, 'No se pudo enviar la respuesta. Inténtalo de nuevo.') }))),
    )),
  ));

  resolveConversation$ = createEffect(() => this.actions.pipe(
    ofType(A.resolveConversation),
    switchMap(({ conversationId }) => this.api.updateConversationStatus(conversationId, 'RESOLVED').pipe(
      map(conversation => A.conversationResolved({ conversation })),
      catchError(error => of(A.conversationResolveFailed({ message: explain(error, 'No se pudo actualizar el estado de la conversación.') }))),
    )),
  ));

  changeAssignee$ = createEffect(() => this.actions.pipe(
    ofType(A.changeConversationAssignee),
    switchMap(({ conversationId, agentId }) => (agentId
      ? this.api.assignConversation(conversationId, agentId)
      : this.api.unassignConversation(conversationId)).pipe(
      map(conversation => A.conversationAssigneeChanged({ conversation })),
      catchError(error => of(A.conversationAssigneeChangeFailed({ message: explain(error, 'No se pudo cambiar la asignación de esta conversación.') }))),
    )),
  ));
}
