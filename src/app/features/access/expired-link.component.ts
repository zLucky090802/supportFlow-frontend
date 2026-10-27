import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccessShellComponent } from './access-shell.component';
@Component({selector:'app-expired-link',imports:[AccessShellComponent,RouterLink],styleUrl:'./access-form.scss',changeDetection:ChangeDetectionStrategy.OnPush,template:`<app-access-shell><span class="chip">ENLACE NO DISPONIBLE</span><h2>Necesitas un nuevo enlace</h2><p class="subtitle">La invitación o el enlace de recuperación venció, ya se utilizó o dejó de estar disponible.</p><div class="result"><h3>Tu cuenta no se ha modificado</h3>Para una invitación, pide a un administrador que la reenvíe. Para recuperar el acceso, solicita un nuevo enlace.</div><p class="foot"><a routerLink="/recuperar-acceso">Solicitar recuperación →</a></p><p class="foot"><a routerLink="/login">Volver al inicio de sesión</a></p></app-access-shell>`})
export class ExpiredLinkComponent {}
