export type InboxFilter = 'all' | 'mine' | 'unassigned';

export interface Conversation {
  id: number;
  name: string;
  initials: string;
  avatarTone: 'sage' | 'sand' | 'lavender' | 'sky' | 'rose';
  channel: 'whatsapp' | 'email' | 'instagram';
  preview: string;
  time: string;
  unread: number;
  assignedTo: string | null;
  status: 'open' | 'waiting' | 'resolved';
  tags: string[];
}
