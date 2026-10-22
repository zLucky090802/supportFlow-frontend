export type TeamGroup = 'all' | 'members' | 'invited';
export type TeamRole = 'Administrador' | 'Agente';
export type TeamAvailability = 'Disponible' | 'Ausente' | 'Desconectado' | 'Invitación pendiente';
export type TeamView = 'default' | 'empty' | 'loading' | 'error';
export interface TeamMember {
  id: number;
  name: string;
  initials: string;
  email: string;
  role: TeamRole;
  state: TeamAvailability;
  group: Exclude<TeamGroup, 'all'>;
  chats: number;
  color: string;
  since: string;
}
// Approved demonstration fixture. No invitations or role changes are sent to a server.
export const TEAM_MEMBERS: readonly TeamMember[] = [
  {
    "id": 1,
    "name": "Camila Torres",
    "initials": "CT",
    "email": "camila@supportflow.demo",
    "role": "Agente",
    "state": "Disponible",
    "group": "members",
    "chats": 5,
    "color": "#dce9df",
    "since": "12 sep 2026"
  },
  {
    "id": 2,
    "name": "Daniel Espitia",
    "initials": "DE",
    "email": "daniel@supportflow.demo",
    "role": "Administrador",
    "state": "Disponible",
    "group": "members",
    "chats": 4,
    "color": "#dfe7ee",
    "since": "1 sep 2026"
  },
  {
    "id": 3,
    "name": "Santiago Ruiz",
    "initials": "SR",
    "email": "santiago@supportflow.demo",
    "role": "Agente",
    "state": "Ausente",
    "group": "members",
    "chats": 3,
    "color": "#eee5d4",
    "since": "15 sep 2026"
  },
  {
    "id": 4,
    "name": "Valentina Rojas",
    "initials": "VR",
    "email": "valentina@supportflow.demo",
    "role": "Agente",
    "state": "Desconectado",
    "group": "members",
    "chats": 0,
    "color": "#e8e1ed",
    "since": "20 sep 2026"
  },
  {
    "id": 5,
    "name": "Andrés López",
    "initials": "AL",
    "email": "andres@supportflow.demo",
    "role": "Agente",
    "state": "Invitación pendiente",
    "group": "invited",
    "chats": 0,
    "color": "#e8eee5",
    "since": "Invitado hoy"
  },
  {
    "id": 6,
    "name": "Laura Martínez",
    "initials": "LM",
    "email": "laura@supportflow.demo",
    "role": "Agente",
    "state": "Invitación pendiente",
    "group": "invited",
    "chats": 0,
    "color": "#eee2df",
    "since": "Invitada ayer"
  }
];
export const TEAM_VIEW_COPY: Record<TeamView, { title: string; description: string }> = {
  default: { title: '', description: '' },
  empty: { title: 'Tu equipo empieza contigo', description: 'Invita a las personas que atenderán a tus clientes en este espacio de trabajo.' },
  loading: { title: 'Cargando el equipo', description: 'Estamos reuniendo la información de integrantes y disponibilidad.' },
  error: { title: 'No pudimos cargar el equipo', description: 'Intenta de nuevo. No se han modificado los integrantes ni las invitaciones.' },
};

