import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccessShellComponent } from './access-shell.component';
@Component({selector:'app-login',imports:[AccessShellComponent,ReactiveFormsModule,RouterLink],styleUrl:'./access-form.scss',changeDetection:ChangeDetectionStrategy.OnPush,template:`<app-access-shell><h2>Qué bueno verte</h2><p class="subtitle">Inicia sesión para volver a tu espacio de trabajo.</p>@if (!done()) {<form [formGroup]="form" (ngSubmit)="submit()" novalidate><label class="field">Correo electrónico<input type="email" formControlName="email" maxlength="254" placeholder="nombre@empresa.com" autocomplete="off"></label><label class="field">Contraseña<input type="password" formControlName="password" placeholder="Usa un valor ficticio" autocomplete="off"></label>@if(form.touched && form.invalid){<p class="error" role="alert">Escribe un correo válido y una contraseña.</p>}<div class="field-row"><span class="help">Solo demostración</span><a routerLink="/recuperar-acceso">¿Olvidaste tu contraseña?</a></div><button class="primary">Iniciar sesión · Demo</button></form>}@else{<div class="result" role="status">Acceso simulado. Ningún dato se ha enviado.<br><a routerLink="/dashboard">Ver Home →</a></div>}</app-access-shell>`})
export class LoginComponent {
 readonly form=inject(FormBuilder).nonNullable.group({email:['',[Validators.required,Validators.email,Validators.maxLength(254)]],password:['',Validators.required]});
 readonly done=signal(false);
 submit(){this.form.markAllAsTouched();if(this.form.invalid)return;this.form.reset();this.done.set(true);}
}
