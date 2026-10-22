// Fixture for the approved layout; not live operational metrics.
export interface DashboardConversation {
  id: number;
  initials: string;
  name: string;
  message: string;
  channel: string;
  owner: string | null;
  time: string;
  unread: number;
  tone: string;
}
export const DASHBOARD_CONVERSATIONS: readonly DashboardConversation[] = [
  { id: 1, initials: 'MG', name: 'María González', message: 'Hola, ¿me ayudas con el estado de mi pedido?', channel: 'WhatsApp', owner: null, time: '2 min', unread: 2, tone: '#dce9df' },
  { id: 2, initials: 'CR', name: 'Carlos Ramírez', message: 'Quisiera conocer los planes disponibles.', channel: 'Correo', owner: null, time: '8 min', unread: 1, tone: '#eee4d2' },
  { id: 3, initials: 'LM', name: 'Laura Martínez', message: 'Gracias, quedo pendiente de la confirmación.', channel: 'Instagram', owner: 'Daniel Espitia', time: '24 min', unread: 3, tone: '#e7e1ed' },
  { id: 4, initials: 'AL', name: 'Andrés López', message: 'No puedo ingresar a mi cuenta.', channel: 'WhatsApp', owner: 'Camila Torres', time: '42 min', unread: 1, tone: '#dce9ed' },
];
export type DashboardState = 'default' | 'empty' | 'loading' | 'error';
export const DASHBOARD_STATES: Record<DashboardState, { title: string; description: string }> = {
  default: { title: '', description: '' },
  empty: { title: 'Todo está tranquilo por aquí', description: 'Aún no hay actividad para hoy. Cuando lleguen las primeras conversaciones, verás el resumen en este espacio.' },
  loading: { title: 'Preparando tu resumen', description: 'Estamos reuniendo la actividad de tu equipo.' },
  error: { title: 'No pudimos cargar el resumen', description: 'Revisa tu conexión e inténtalo de nuevo. Tus conversaciones no se han modificado.' },
};

