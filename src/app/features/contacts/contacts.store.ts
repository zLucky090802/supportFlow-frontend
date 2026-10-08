import { Injectable, signal } from '@angular/core';
import { Contact, CONTACTS } from './contacts.data';

export type ContactDraft = Pick<Contact, 'name' | 'email' | 'channel' | 'tag'>;
export const CONTACTS_STORAGE_KEY = 'supportflow.contacts.local.v1';

export function validateDraft(value: ContactDraft): string | null {
  if (!value.name.trim() || value.name.trim().length > 100) return 'El nombre es obligatorio y debe tener hasta 100 caracteres.';
  if (value.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) return 'Introduce un correo electrónico válido.';
  if (!['WhatsApp', 'Correo', 'Instagram'].includes(value.channel)) return 'Canal no válido: usa WhatsApp, Correo o Instagram.';
  if (!['Cliente', 'VIP', 'Prospecto'].includes(value.tag)) return 'Etiqueta no válida: usa Cliente, VIP o Prospecto.';
  return null;
}

/** CSV con comas o punto y coma; admite comillas escapadas y saltos de línea. */
export function parseContactsCsv(source: string): ContactDraft[] {
  const text = source.replace(/^\uFEFF/, '');
  const delimiter = text.split(/\r?\n/, 1)[0].includes(';') ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false, closed = false;
  const endField = () => { row.push(field.trim()); field = ''; closed = false; };
  const endRow = () => { endField(); if (row.some(Boolean)) rows.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else field += c;
    } else if (c === delimiter) endField();
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; endRow(); }
    else if (c === '"' && !field && !closed) quoted = true;
    else if (closed || c === '"') throw new Error('El CSV contiene comillas mal cerradas.');
    else field += c;
  }
  if (quoted) throw new Error('El CSV contiene comillas sin cerrar.');
  endRow();
  const headers = rows.shift()?.map(h => h.toLocaleLowerCase('es')) ?? [];
  if (headers.length !== 4 || new Set(headers).size !== 4 || !['nombre', 'correo', 'canal', 'etiqueta'].every(h => headers.includes(h))) {
    throw new Error('El CSV debe tener las columnas nombre, correo, canal, etiqueta.');
  }
  if (!rows.length || rows.length > 1000) throw new Error('Importa entre 1 y 1.000 contactos por archivo.');
  return rows.map((values, index) => {
    if (values.length !== 4) throw new Error(`Registro ${index + 1}: se esperaban 4 columnas.`);
    const get = (name: string) => values[headers.indexOf(name)];
    const draft: ContactDraft = { name: get('nombre'), email: get('correo'), channel: get('canal') as Contact['channel'], tag: get('etiqueta') as Contact['tag'] };
    const error = validateDraft(draft);
    if (error) throw new Error(`Registro ${index + 1}: ${error}`);
    return draft;
  });
}

@Injectable({ providedIn: 'root' })
export class ContactsStore {
  private readonly items = signal<readonly Contact[]>(CONTACTS);
  readonly contacts = this.items.asReadonly();
  readonly warning = signal('');

  constructor() {
    try {
      const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (!raw) return;
      const saved: unknown = JSON.parse(raw);
      if (!Array.isArray(saved) || !saved.every(this.isDraft)) throw new Error();
      const emails = new Set(CONTACTS.map(c => c.email.toLowerCase()));
      const loaded: Contact[] = [];
      for (const draft of saved) {
        const email = draft.email.trim().toLowerCase();
        if (emails.has(email)) throw new Error();
        emails.add(email);
        loaded.push(this.toContact(draft, CONTACTS.length + loaded.length + 1));
      }
      this.items.set([...CONTACTS, ...loaded]);
    } catch {
      this.warning.set('No se pudieron recuperar los contactos locales. Los datos guardados no se han sobrescrito.');
    }
  }

  private isDraft(value: unknown): value is ContactDraft {
    if (!value || typeof value !== 'object') return false;
    const draft = value as ContactDraft;
    return ['name', 'email', 'channel', 'tag'].every(k => typeof (value as Record<string, unknown>)[k] === 'string') && !validateDraft(draft);
  }

  private toContact(draft: ContactDraft, id: number): Contact {
    return { ...draft, name: draft.name.trim(), email: draft.email.trim().toLowerCase(), id,
      initials: draft.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase(),
      owner: 'Sin asignar', tone: '#dce9df', time: 'Sin conversaciones', since: 'Contacto guardado en este navegador' };
  }

  add(drafts: readonly ContactDraft[]): { added: number; duplicates: number; firstId?: number } {
    if (this.warning()) throw new Error('El almacenamiento local no pudo recuperarse. No se guardaron cambios para proteger los datos existentes.');
    const emails = new Set(this.items().map(c => c.email.toLowerCase()));
    const added: Contact[] = [];
    let duplicates = 0;
    const nextId = Math.max(...this.items().map(c => c.id)) + 1;
    for (const draft of drafts) {
      const error = validateDraft(draft);
      if (error) throw new Error(error);
      const email = draft.email.trim().toLowerCase();
      if (emails.has(email)) { duplicates++; continue; }
      emails.add(email);
      added.push(this.toContact(draft, nextId + added.length));
    }
    if (!added.length) return { added: 0, duplicates };
    const result = [...this.items(), ...added];
    const saved = result.filter(c => !CONTACTS.some(seed => seed.id === c.id)).map(({ name, email, channel, tag }) => ({ name, email, channel, tag }));
    try { localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(saved)); }
    catch { throw new Error('No se pudo guardar en este navegador. Comprueba el espacio disponible y los permisos de almacenamiento.'); }
    this.items.set(result);
    return { added: added.length, duplicates, firstId: added[0].id };
  }
}
