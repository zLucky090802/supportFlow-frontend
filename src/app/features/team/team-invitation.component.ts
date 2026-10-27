import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { TEAM_MEMBERS, TeamRole } from './team.data';

const trimmedEmail: ValidatorFn = control => {
  const value = String(control.value ?? '').trim();
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : { email: true };
};

@Component({
  selector: 'app-team-invitation',
  imports: [ReactiveFormsModule, RouterLink, AppSidebarComponent, AppIconComponent],
  templateUrl: './team-invitation.component.html', styleUrl: './team-invitation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamInvitationComponent {
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly compact = signal(false);
  readonly feedback = signal('');
  readonly duplicate = signal(false);
  readonly form = this.fb.group({
    email: ['', [Validators.required, trimmedEmail, Validators.maxLength(254)]],
    role: this.fb.control<TeamRole>('Agente'),
  });
  readonly role = toSignal(this.form.controls.role.valueChanges, { initialValue: this.form.controls.role.value });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => { this.feedback.set(''); this.duplicate.set(false); });
  }

  invite(): void {
    this.feedback.set(''); this.duplicate.set(false); this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const email = this.form.controls.email.value.trim().toLowerCase();
    if (TEAM_MEMBERS.some(member => member.email.toLowerCase() === email)) {
      this.duplicate.set(true);
      this.feedback.set('Esta persona ya pertenece al equipo o tiene una invitación pendiente.');
      return;
    }
    this.feedback.set(`Invitación simulada para ${email}. No se envió ningún correo ni se agregó una persona al equipo real.`);
  }
}
