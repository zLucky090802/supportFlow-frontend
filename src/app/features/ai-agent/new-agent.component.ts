import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AGENTS, AgentRecord } from './agents.data';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AGENT_SCENARIOS, DEFAULT_INSTRUCTIONS } from './new-agent.data';

const nonBlank: ValidatorFn = control => typeof control.value === 'string' && control.value.trim() ? null : { blank: true };
@Component({
  selector: 'app-new-agent',
  imports: [ReactiveFormsModule, RouterLink, AppIconComponent, AppSidebarComponent],
  templateUrl: './new-agent.component.html',
  styleUrl: './new-agent.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewAgentComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly agent = signal<AgentRecord | null>(null);
  readonly notFound = signal(false);
  readonly compact = signal(false);
  readonly feedback = signal('');
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60), nonBlank]],
    tone: ['Cercano y profesional'],
    instructions: [DEFAULT_INSTRUCTIONS, [Validators.required, Validators.maxLength(1200), nonBlank]],
    handoff: ['Bandeja · Sin asignar'],
  });
  private readonly changes = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly values = computed(() => { this.changes(); return this.form.getRawValue(); });
  readonly scenarios = AGENT_SCENARIOS;
  readonly scenario = signal<'hours' | 'unknown' | 'human'>('hours');
  readonly example = computed(() => this.scenarios.find(item => item.id === this.scenario()) ?? this.scenarios[0]);
  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.feedback.set(''));
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const id = params.get('id');
      const agent = AGENTS.find(record => record.id === id) ?? null;
      this.agent.set(agent);
      this.notFound.set(id !== null && agent === null);
      this.form.reset({ name: agent?.name ?? '', tone: agent?.tone ?? 'Cercano y profesional', instructions: agent?.instructions ?? DEFAULT_INSTRUCTIONS, handoff: 'Bandeja · Sin asignar' });
      this.scenario.set('hours');
    });
  }
  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.notFound()) return;
    this.feedback.set('Guardado simulado. No se ha creado ni modificado un agente real. Los cambios se perderán al salir o recargar.');
  }
}

