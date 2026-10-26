import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';

type SettingsSection = 'workspace' | 'profile' | 'channels' | 'hours';
type SettingsView = 'ready' | 'empty' | 'loading' | 'error';
const nonBlank: ValidatorFn = control => String(control.value ?? '').trim() ? null : { blank: true };
const validHours: ValidatorFn = control => {
  const { days, start, end } = control.value as { days: boolean[]; start: string; end: string };
  return days.some(Boolean) && start && end && start < end ? null : { schedule: true };
};

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, RouterLink, AppSidebarComponent, AppIconComponent],
  templateUrl: './settings.component.html', styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly compact = signal(false);
  readonly section = signal<SettingsSection>('workspace');
  readonly view = signal<SettingsView>('ready');
  readonly feedback = signal('');
  readonly dialogTitle = signal('');
  readonly dialogDescription = signal('');
  readonly sections: readonly { id: SettingsSection; label: string }[] = [
    { id: 'workspace', label: 'Espacio de trabajo' }, { id: 'profile', label: 'Mi perfil' },
    { id: 'channels', label: 'Canales' }, { id: 'hours', label: 'Horario de atención' },
  ];
  readonly dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly stateCopy: Record<SettingsView, { title: string; text: string }> = {
    ready: { title: '', text: '' },
    empty: { title: 'Aún no hay información', text: 'Los ajustes del espacio de trabajo aparecerán aquí.' },
    loading: { title: 'Cargando ajustes', text: 'Estamos reuniendo la información del espacio de trabajo.' },
    error: { title: 'No pudimos cargar los ajustes', text: 'Intenta de nuevo. No se ha modificado ninguna configuración.' },
  };
  readonly workspace = this.fb.group({ name: ['Support Flow', [Validators.required, nonBlank, Validators.maxLength(80)]], language: ['Español'], timezone: ['America/Bogota · UTC−5'] });
  readonly profile = this.fb.group({ name: ['Daniel Espitia', [Validators.required, nonBlank, Validators.maxLength(100)]], email: ['daniel@supportflow.demo'], availability: ['Disponible'] });
  readonly hours = this.fb.group({
    days: this.fb.array(this.dayNames.map((_, i) => this.fb.control(i < 5))),
    start: ['08:00', Validators.required], end: ['18:00', Validators.required],
    message: ['Gracias por escribirnos. Nuestro equipo volverá a atenderte en su siguiente jornada.', [Validators.required, nonBlank, Validators.maxLength(500)]],
  }, { validators: validHours });

  constructor() {
    inject(ActivatedRoute).queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const section = this.sections.find(item => item.id === params.get('section'));
      this.selectSection(section?.id ?? 'workspace');
    });
    merge(this.workspace.valueChanges, this.profile.valueChanges, this.hours.valueChanges)
      .pipe(takeUntilDestroyed()).subscribe(() => this.feedback.set(''));
  }
  selectSection(section: SettingsSection): void { this.section.set(section); this.feedback.set(''); }
  changeView(value: string): void {
    if (value === 'ready' || value === 'empty' || value === 'loading' || value === 'error') this.view.set(value);
  }
  save(section: 'workspace' | 'profile' | 'hours'): void {
    const form = this[section];
    this.feedback.set(''); form.markAllAsTouched();
    if (form.invalid) return;
    this.feedback.set(section === 'hours'
      ? 'Horario guardado de forma simulada. No se modificó el horario real ni se enviaron mensajes.'
      : 'Cambios guardados de forma simulada. No se modificó información real. Los cambios se perderán al salir o recargar.');
  }
  openChannel(channel: string, dialog: HTMLDialogElement): void {
    this.dialogTitle.set(channel === 'WhatsApp' ? 'Conexión de WhatsApp · Demo' : `Conectar ${channel}`);
    this.dialogDescription.set(channel === 'WhatsApp'
      ? 'Aquí se mostrarían los datos de la conexión y la cuenta autorizada. No hay una cuenta real conectada.'
      : 'En el producto continuarías a la autorización segura del proveedor. Esta vista solo permite revisar el paso previo; no se solicitarán credenciales ni se abrirá una conexión real.');
    dialog.showModal();
  }
}
