import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { loginRequested } from '../../core/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../core/auth/auth.selectors';
import { AccessShellComponent } from './access-shell.component';
@Component({selector:'app-login',imports:[AccessShellComponent,ReactiveFormsModule,RouterLink],styleUrl:'./access-form.scss',changeDetection:ChangeDetectionStrategy.OnPush,template:`<app-access-shell><h2>Qué bueno verte</h2><p class="subtitle">Inicia sesión para volver a tu espacio de trabajo.</p><form [formGroup]="form" (ngSubmit)="submit()" novalidate><label class="field">Correo electrónico<input type="email" formControlName="email" maxlength="254" autocomplete="username"></label><label class="field">Contraseña<input type="password" formControlName="password" maxlength="128" autocomplete="current-password"></label>@if(form.controls.email.touched && form.controls.email.invalid){<p class="error" role="alert">Escribe un correo electrónico válido.</p>}@if(form.controls.password.touched && form.controls.password.invalid){<p class="error" role="alert">Escribe tu contraseña.</p>}@if(error()){<p class="error" role="alert">{{error()}}</p>}<div class="field-row"><span class="help">Tu sesión se valida con Support Flow</span><a routerLink="/recuperar-acceso">¿Olvidaste tu contraseña?</a></div><button class="primary" type="submit" [disabled]="loading()">{{loading()?'Validando…':'Iniciar sesión'}}</button></form></app-access-shell>`})
export class LoginComponent {
 private readonly store=inject(Store);
 private readonly route=inject(ActivatedRoute);
 readonly loading=this.store.selectSignal(selectAuthLoading);
 readonly error=this.store.selectSignal(selectAuthError);
 readonly form=inject(FormBuilder).nonNullable.group({email:['',[Validators.required,Validators.email,Validators.maxLength(254)]],password:['',[Validators.required,Validators.maxLength(128)]]});
 submit(){this.form.markAllAsTouched();if(this.form.invalid||this.loading())return;const {email,password}=this.form.getRawValue();this.store.dispatch(loginRequested({email,password,returnUrl:this.route.snapshot.queryParamMap.get('returnUrl')??'/dashboard'}));}
}
