import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
type Provider = 'WhatsApp' | 'Instagram' | 'Correo';
type Step = 'overview' | 'provider' | 'authorize' | 'account' | 'success' | 'error';
interface Connection { provider: Provider; primary: string; account: string; secondary: string; label: string; state: 'Conectado' | 'Requiere atención' | 'Sin conectar'; icon: string; }
@Component({ selector: 'app-connections', imports: [FormsModule, RouterLink, AppSidebarComponent], templateUrl: './connections.component.html', styleUrl: './connections.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ConnectionsComponent {
  readonly compact = signal(false);
  readonly step = signal<Step>('overview');
  readonly view = signal<'ready' | 'empty' | 'loading' | 'error'>('ready');
  readonly provider = signal<Provider>('WhatsApp');
  readonly links = signal<Connection[]>([
    { provider: 'WhatsApp', primary: '+57 300 000 0000', account: '+57 300 000 0000', secondary: '+57 300 000 0001', label: 'Soporte principal', state: 'Conectado', icon: 'W' },
    { provider: 'Instagram', primary: '@supportflow.demo', account: '@supportflow.demo', secondary: '@supportflow.ventas', label: 'Perfil de la marca', state: 'Requiere atención', icon: '◎' },
    { provider: 'Correo', primary: 'soporte@supportflow.demo', account: 'soporte@supportflow.demo', secondary: 'ventas@supportflow.demo', label: 'Tu bandeja de soporte', state: 'Sin conectar', icon: '✉' },
  ]);
  readonly selected = computed(() => this.links().find(c => c.provider === this.provider())!);
  readonly activeCount = computed(() => this.links().filter(c => c.state === 'Conectado').length);
  readonly errorTitle = signal('');
  readonly errorCopy = signal('');
  readonly accountError = signal('');
  readonly feedback = signal('');
  account = '';
  channelName = 'Soporte principal';
  readonly steps = [{ id: 'provider', name: 'Canal' }, { id: 'authorize', name: 'Autorizar' }, { id: 'account', name: 'Cuenta' }, { id: 'success', name: 'Listo' }];
  start(provider: Provider): void { this.provider.set(provider); this.account = ''; this.channelName = 'Soporte principal'; this.accountError.set(''); this.feedback.set(''); this.view.set('ready'); this.step.set('authorize'); }
  overview(): void { this.step.set('overview'); this.view.set('ready'); }
  cancel(): void { this.overview(); this.feedback.set('Vinculación cancelada. No se modificó ninguna cuenta.'); }
  error(kind: 'authorization' | 'cancel' | 'accounts'): void {
    const errors = { authorization: ['No pudimos autorizar la conexión', 'La autorización no se completó. Tus cuentas no se han modificado.'], cancel: ['Permiso cancelado', 'No concediste acceso a la cuenta. Puedes volver a intentar cuando quieras.'], accounts: ['No hay cuentas disponibles', 'Revisa la cuenta utilizada y sus permisos con el proveedor. Este es un estado simulado.'] };
    this.errorTitle.set(errors[kind][0]); this.errorCopy.set(errors[kind][1]); this.step.set('error');
  }
  connect(): void {
    if (!['primary', 'secondary'].includes(this.account) || !this.channelName.trim() || this.channelName.trim().length > 60) { this.accountError.set('Elige una cuenta y escribe un nombre de hasta 60 caracteres para el canal.'); return; }
    this.links.update(links => links.map(c => c.provider === this.provider() ? { ...c, account: this.account === 'secondary' ? c.secondary : c.primary, label: this.channelName.trim(), state: 'Conectado' } : c));
    this.accountError.set(''); this.step.set('success');
  }
  disconnect(): void { this.links.update(links => links.map(c => c.provider === this.provider() ? { ...c, state: 'Sin conectar' } : c)); this.overview(); this.feedback.set('Desconexión simulada de ' + this.provider() + '. Se conserva solo hasta recargar.'); }
}
