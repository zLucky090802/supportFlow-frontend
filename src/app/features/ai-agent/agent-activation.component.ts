import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AGENTS, AgentRecord } from './agents.data';

@Component({
  selector: 'app-agent-activation',
  imports: [ReactiveFormsModule, RouterLink, AppIconComponent, AppSidebarComponent],
  templateUrl: './agent-activation.component.html',
  styleUrl: './agent-activation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentActivationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly compact = signal(false);
  readonly agent = signal<AgentRecord | null>(null);
  readonly activated = signal(false);
  readonly feedback = signal('');
  readonly form = this.fb.nonNullable.group({
    channel: ['', [Validators.required, Validators.pattern(/^whatsapp-demo$/)]],
    identityReviewed: [false, Validators.requiredTrue],
    knowledgeReviewed: [false, Validators.requiredTrue],
    handoffReviewed: [false, Validators.requiredTrue],
  });
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.agent.set(AGENTS.find(agent => agent.id === params.get('id')) ?? null);
      this.form.enable(); this.form.reset(); this.activated.set(false); this.feedback.set('');
    });
  }
  review(dialog: HTMLDialogElement): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.agent() || this.agent()?.state === 'Activo' || this.activated()) return;
    dialog.showModal();
  }
  activate(): void {
    if (this.form.invalid || !this.agent() || this.agent()?.state === 'Activo' || this.activated()) return;
    this.activated.set(true);
    this.feedback.set('Activación simulada. No se conectó ni activó ningún agente real. Este estado se pierde al salir o recargar.');
    this.form.disable();
  }
}
