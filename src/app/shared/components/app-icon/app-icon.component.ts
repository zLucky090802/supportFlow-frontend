import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type AppIconName =
  | 'archive' | 'chart' | 'check' | 'chevron-down' | 'chevron-left'
  | 'email' | 'inbox' | 'info' | 'instagram' | 'more' | 'panel-left'
  | 'paperclip' | 'plus' | 'search' | 'send' | 'settings' | 'smile'
  | 'sparkles' | 'users' | 'whatsapp';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (name()) {
        @case ('panel-left') { <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5zM9 4v16" /> }
        @case ('inbox') { <path d="M4 5h16l-1.5 13h-13zM4.8 13h4l1.5 2h3.4l1.5-2h4" /> }
        @case ('users') { <path d="M16 20v-1.7a3.3 3.3 0 0 0-3.3-3.3H7.3A3.3 3.3 0 0 0 4 18.3V20M10 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M17 8a3 3 0 0 1 0 5.8M20 20v-1.5a3 3 0 0 0-2.2-2.9" /> }
        @case ('sparkles') { <path d="m12 3 .8 2.4A5.7 5.7 0 0 0 16.4 9l2.6.9-2.6.8a5.7 5.7 0 0 0-3.6 3.6L12 17l-.8-2.7a5.7 5.7 0 0 0-3.6-3.6L5 9.9 7.6 9a5.7 5.7 0 0 0 3.6-3.6zM18.5 16l.4 1.1a2.8 2.8 0 0 0 1.7 1.7l1.1.4-1.1.4a2.8 2.8 0 0 0-1.7 1.7l-.4 1.1-.4-1.1a2.8 2.8 0 0 0-1.7-1.7l-1.1-.4 1.1-.4a2.8 2.8 0 0 0 1.7-1.7z" /> }
        @case ('chart') { <path d="M5 20V10M12 20V4M19 20v-7" /> }
        @case ('settings') { <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1" /> }
        @case ('search') { <circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /> }
        @case ('plus') { <path d="M12 5v14M5 12h14" /> }
        @case ('chevron-down') { <path d="m7 9 5 5 5-5" /> }
        @case ('chevron-left') { <path d="m14.5 6-6 6 6 6" /> }
        @case ('check') { <path d="m5 12 4 4L19 6" /> }
        @case ('more') { <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /> }
        @case ('info') { <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /> }
        @case ('archive') { <path d="M4 7h16M5 7l1 13h12l1-13M3 4h18v3H3zM9 11h6" /> }
        @case ('paperclip') { <path d="m20.5 11.5-8.2 8.2a5 5 0 0 1-7.1-7.1l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-2.8-2.8l8.2-8.2" /> }
        @case ('smile') { <circle cx="12" cy="12" r="9" /><path d="M8 14s1.3 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /> }
        @case ('send') { <path d="m4 4 17 8-17 8 3-8zM7 12h14" /> }
        @case ('whatsapp') { <path d="M20 11.7a8 8 0 0 1-11.8 7l-4.2 1.1 1.1-4.1A8 8 0 1 1 20 11.7Z" /><path d="M9 8.5c.3 2.7 2 4.5 4.7 5.2l1-1.2 1.8.8c-.2 1.2-1 2-2.2 2-3.8 0-7.3-3.4-7.3-7.2 0-1.2.8-2 2-2.2l.8 1.8z" /> }
        @case ('email') { <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /> }
        @case ('instagram') { <rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.5" /><circle cx="17.2" cy="6.8" r=".8" fill="currentColor" stroke="none" /> }
      }
    </svg>
  `,
  styles: `:host { display: inline-flex; flex: 0 0 auto; }`,
})
export class AppIconComponent {
  readonly name = input.required<AppIconName>();
  readonly size = input(20);
}
