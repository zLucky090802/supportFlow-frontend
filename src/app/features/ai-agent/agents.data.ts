export type AgentStatus = 'Activo' | 'Borrador' | 'Pausado';
export interface AgentRecord {
  id: string; name: string; purpose: string; state: AgentStatus; tone: string; channel: string;
  updated: string; knowledge: string; instructions: string;
}
// Demonstration records; not connected to a model or backend.
export const AGENTS: readonly AgentRecord[] = [
  {
    "id": "1",
    "name": "Asistente de soporte",
    "purpose": "Resuelve consultas frecuentes de tus clientes.",
    "state": "Activo",
    "tone": "Cercano y profesional",
    "channel": "WhatsApp",
    "updated": "Hoy, 9:30 a. m.",
    "knowledge": "24 artículos publicados",
    "instructions": "Resuelve consultas frecuentes de tus clientes.\nUsa únicamente la información publicada en la base de conocimiento.\nSi no tienes una respuesta o el cliente pide una persona, deriva al equipo."
  },
  {
    "id": "2",
    "name": "Asistente comercial",
    "purpose": "Orienta sobre los productos y servicios.",
    "state": "Borrador",
    "tone": "Breve y directo",
    "channel": "Sin configurar",
    "updated": "Ayer, 4:15 p. m.",
    "knowledge": "Pendiente de revisar",
    "instructions": "Orienta sobre los productos y servicios.\nUsa únicamente la información publicada en la base de conocimiento.\nSi no tienes una respuesta o el cliente pide una persona, deriva al equipo."
  },
  {
    "id": "3",
    "name": "Asistente de seguimiento",
    "purpose": "Acompaña a los clientes después de la atención.",
    "state": "Pausado",
    "tone": "Cercano y profesional",
    "channel": "Correo",
    "updated": "20 oct, 11:00 a. m.",
    "knowledge": "24 artículos publicados",
    "instructions": "Acompaña a los clientes después de la atención.\nUsa únicamente la información publicada en la base de conocimiento.\nSi no tienes una respuesta o el cliente pide una persona, deriva al equipo."
  },
  {
    "id": "4",
    "name": "Asistente de bienvenida",
    "purpose": "Recibe y orienta las nuevas conversaciones.",
    "state": "Borrador",
    "tone": "Formal",
    "channel": "Sin configurar",
    "updated": "19 oct, 2:40 p. m.",
    "knowledge": "Pendiente de revisar",
    "instructions": "Recibe y orienta las nuevas conversaciones.\nUsa únicamente la información publicada en la base de conocimiento.\nSi no tienes una respuesta o el cliente pide una persona, deriva al equipo."
  }
];
export function agentStateDescription(state: AgentStatus): string {
  return state === 'Activo' ? 'En una integración real, atendería las conversaciones del canal configurado. Aquí solo es un ejemplo visual.'
    : state === 'Borrador' ? 'Todavía no atiende conversaciones. Su configuración se puede preparar antes de activarlo.'
    : 'Conserva su configuración, pero no atiende nuevas conversaciones mientras esté pausado.';
}

