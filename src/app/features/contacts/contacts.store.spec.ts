import { ContactDraft, ContactsStore, parseContactsCsv, CONTACTS_STORAGE_KEY } from './contacts.store';

describe('Contact creation and CSV import', () => {
  const draft: ContactDraft = { name: 'Ana Pérez', email: 'ana@example.com', channel: 'WhatsApp', tag: 'Cliente' };
  let saved: Map<string, string>;
  beforeEach(() => {
    saved = new Map();
    spyOn(localStorage, 'getItem').and.callFake(key => saved.get(key) ?? null);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => { saved.set(key, value); });
  });

  it('saves a new contact and restores it without inventing a conversation', () => {
    const store = new ContactsStore();
    expect(store.add([draft]).added).toBe(1);
    const restored = new ContactsStore().contacts().find(c => c.email === draft.email);
    expect(restored?.name).toBe(draft.name);
    expect(restored?.conversationId).toBeUndefined();
  });

  it('skips duplicate emails within the file and against existing contacts', () => {
    const result = new ContactsStore().add([draft, { ...draft, email: ' ANA@EXAMPLE.COM ' }, { ...draft, email: 'maria.gonzalez@mail.com' }]);
    expect(result).toEqual(jasmine.objectContaining({ added: 1, duplicates: 2 }));
  });

  it('parses a BOM, quoted separators, escaped quotes and multiline fields', () => {
    const csv = '\uFEFFnombre,correo,canal,etiqueta\r\n"Ana, ""Equipo""\nPérez",ana@example.com,WhatsApp,VIP';
    expect(parseContactsCsv(csv)[0].name).toBe('Ana, "Equipo"\nPérez');
    expect(parseContactsCsv('correo;nombre;etiqueta;canal\nana@example.com;Ana;Cliente;Correo')[0].channel).toBe('Correo');
  });

  it('rejects invalid records and malformed headers without a partial save', () => {
    expect(() => parseContactsCsv('nombre,correo,canal,etiqueta\nAna,invalid,Correo,Cliente')).toThrowError(/Registro 1/);
    expect(() => parseContactsCsv('nombre,nombre,canal,etiqueta')).toThrowError(/columnas/);
    const store = new ContactsStore();
    expect(() => store.add([draft, { ...draft, email: 'invalid' }])).toThrow();
    expect(store.contacts().length).toBe(8);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('keeps the current list unchanged when storage fails', () => {
    const store = new ContactsStore();
    (localStorage.setItem as jasmine.Spy).and.throwError('QuotaExceeded');
    expect(() => store.add([draft])).toThrowError(/No se pudo guardar/);
    expect(store.contacts().length).toBe(8);
  });

  it('preserves unreadable saved data and reports the problem', () => {
    saved.set(CONTACTS_STORAGE_KEY, '{broken');
    const store = new ContactsStore();
    expect(store.warning()).toBeTruthy();
    expect(() => store.add([draft])).toThrow();
    expect(saved.get(CONTACTS_STORAGE_KEY)).toBe('{broken');
  });
});
