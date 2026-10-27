import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccessShellComponent } from './access-shell.component';
@Component({selector:'app-accept-invitation',imports:[AccessShellComponent,ReactiveFormsModule,RouterLink],styleUrl:'./access-form.scss',changeDetection:ChangeDetectionStrategy.OnPush,template:`<app-access-shell><h2>Hay un lugar para ti</h2><p class="subtitle">Camila te invitó a formar parte del equipo.</p><div class="summary"><strong>Support Flow</strong><br>Equipo: Soporte principal<br>Rol: Agente<br>Invitación para: persona&#64;supportflow.demo</div>@if(!done()){<form [formGroup]="form" (ngSubmit)="submit()" novalidate><label class="field">Tu nombre<input formControlName="name" maxlength="80" placeholder="¿Cómo quieres que te llamemos?"></label>@if(form.touched && form.invalid){<p class="error" role="alert">Escribe tu nombre, hasta 80 caracteres.</p>}<p class="help">Después de aceptar, continuarías con el acceso o creación de tu cuenta según tu situación.</p><button class="primary">Aceptar invitación · Demo</button></form>}@else{<div class="result" role="status">Invitación aceptada de forma simulada. No se creó ni añadió un usuario.<br><a routerLink="/login">Continuar al acceso →</a></div>}</app-access-shell>`})
export class AcceptInvitationComponent {
 readonly form=inject(FormBuilder).nonNullable.group({name:['',[Validators.required,Validators.maxLength(80),Validators.pattern(/\S/)]]});readonly done=signal(false);
 submit(){this.form.markAllAsTouched();if(this.form.invalid)return;this.form.reset();this.done.set(true);}
}
