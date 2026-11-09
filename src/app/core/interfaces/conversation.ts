export type InboxFilter = 'all' | 'mine' | 'unassigned';

export interface Conversation {
  id: number | string;
  name: string;
  initials: string;
  avatarTone: 'sage' | 'sand' | 'lavender' | 'sky' | 'rose';
  channel: 'whatsapp' | 'email' | 'instagram' | 'unknown';
  preview: string;
  time: string;
  unread: number;
  assignedTo: string | null;
  assignedToId?: string | null;
  status: 'open' | 'waiting' | 'resolved';
  tags: string[];
  email?: string;
}
