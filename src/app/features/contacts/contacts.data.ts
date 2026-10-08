export interface Contact {
  id: number;
  name: string;
  email: string;
  initials: string;
  channel: 'WhatsApp' | 'Correo' | 'Instagram';
  tag: 'Cliente' | 'VIP' | 'Prospecto';
  time: string;
  owner: string;
  tone: string;
  recent?: boolean;
  starred?: boolean;
  since?: string;
  note?: string;
  conversationId?: number;
}

export const CONTACTS: readonly Contact[] = [
  { id: 1, conversationId: 1, name: 'María González', email: 'maria.gonzalez@mail.com', initials: 'MG', channel: 'WhatsApp', tag: 'Cliente', time: 'Hace 2 minutos', owner: 'Daniel Espitia', recent: true, starred: true, tone: '#dce9df', since: 'Cliente desde mayo de 2024', note: 'Prefiere recibir las actualizaciones de su caso por WhatsApp.' },
  { id: 2, conversationId: 2, name: 'Carlos Ramírez', email: 'carlos.ramirez@mail.com', initials: 'CR', channel: 'Correo', tag: 'Prospecto', time: 'Hace 8 minutos', owner: 'Sin asignar', recent: true, tone: '#eee4d2' },
  { id: 3, conversationId: 3, name: 'Laura Martínez', email: 'laura.martinez@mail.com', initials: 'LM', channel: 'Instagram', tag: 'VIP', time: 'Hace 24 minutos', owner: 'Daniel Espitia', recent: true, starred: true, tone: '#e7e1ed' },
  { id: 4, conversationId: 4, name: 'Andrés López', email: 'andres.lopez@mail.com', initials: 'AL', channel: 'WhatsApp', tag: 'Cliente', time: 'Hace 42 minutos', owner: 'Sin asignar', tone: '#dce9ed' },
  { id: 5, conversationId: 5, name: 'Sofía Herrera', email: 'sofia.herrera@mail.com', initials: 'SH', channel: 'Correo', tag: 'Cliente', time: 'Hace 1 hora', owner: 'Camila Torres', tone: '#eee0df' },
  { id: 6, conversationId: 6, name: 'Nicolás Castro', email: 'nicolas.castro@mail.com', initials: 'NC', channel: 'WhatsApp', tag: 'Prospecto', time: 'Hace 2 horas', owner: 'Daniel Espitia', tone: '#e1e8d5' },
  { id: 7, name: 'Valentina Rojas', email: 'valentina.rojas@mail.com', initials: 'VR', channel: 'Instagram', tag: 'Cliente', time: 'Ayer', owner: 'Camila Torres', tone: '#e8e3da' },
  { id: 8, name: 'Diego Moreno', email: 'diego.moreno@mail.com', initials: 'DM', channel: 'Correo', tag: 'Cliente', time: 'Ayer', owner: 'Daniel Espitia', tone: '#dfe5ed' },
];
