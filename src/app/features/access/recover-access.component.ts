import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccessShellComponent } from './access-shell.component';
@Component({selector:'app-recover-access',imports:[AccessShellComponent,ReactiveFormsModule,RouterLink],styleUrl:'./access-form.scss',changeDetection:ChangeDetectionStrategy.OnPush,template:`<app-access-shell><h2>Recupera tu acceso</h2><p class="subtitle">Te ayudamos a volver a tu espacio de trabajo.</p>@if(!done()){<form [formGroup]="form" (ngSubmit)="submit()" novalidate><label class="field">Correo electrónico<input type="email" formControlName="email" maxlength="254" placeholder="nombre@empresa.com" autocomplete="off"></label>@if(form.touched && form.invalid){<p role="alert" class="error">Escribe un correo electrónico válido.</p>}<button class="primary">Enviar enlace · Demo</button></form>}@else{<div class="result" role="status"><h3>Revisa tu correo</h3>Si existe una cuenta con ese correo, recibirías las instrucciones para recuperar el acceso. Esta demo no envía mensajes.</div>}<p class="foot"><a routerLink="/login">← Volver a iniciar sesión</a></p></app-access-shell>`})
export class RecoverAccessComponent {
 readonly form=inject(FormBuilder).nonNullable.group({email:['',[Validators.required,Validators.email,Validators.maxLength(254)]]});readonly done=signal(false);
 submit(){this.form.markAllAsTouched();if(this.form.invalid)return;this.form.reset();this.done.set(true);}
}
