import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import { AccessShellComponent } from './access-shell.component';
@Component({selector:'app-login',imports:[AccessShellComponent,ReactiveFormsModule,RouterLink],styleUrl:'./access-form.scss',changeDetection:ChangeDetectionStrategy.OnPush,template:`<app-access-shell><h2>Qué bueno verte</h2><p class="subtitle">Inicia sesión para volver a tu espacio de trabajo.</p><form [formGroup]="form" (ngSubmit)="submit()" novalidate><label class="field">Correo electrónico<input type="email" formControlName="email" maxlength="254" autocomplete="username"></label><label class="field">Contraseña<input type="password" formControlName="password" maxlength="128" autocomplete="current-password"></label>@if(form.controls.email.touched && form.controls.email.invalid){<p class="error" role="alert">Escribe un correo electrónico válido.</p>}@if(form.controls.password.touched && form.controls.password.invalid){<p class="error" role="alert">Escribe tu contraseña.</p>}@if(error()){<p class="error" role="alert">{{error()}}</p>}<div class="field-row"><span class="help">Tu sesión se valida con Support Flow</span><a routerLink="/recuperar-acceso">¿Olvidaste tu contraseña?</a></div><button class="primary" type="submit" [disabled]="loading()">{{loading()?'Validando…':'Iniciar sesión'}}</button></form></app-access-shell>`})
export class LoginComponent {
 private readonly auth=inject(AuthSessionService);
 private readonly router=inject(Router);
 private readonly route=inject(ActivatedRoute);
 readonly loading=signal(false);
 readonly error=signal('');
 readonly form=inject(FormBuilder).nonNullable.group({email:['',[Validators.required,Validators.email,Validators.maxLength(254)]],password:['',[Validators.required,Validators.maxLength(128)]]});
 submit(){this.form.markAllAsTouched();this.error.set('');if(this.form.invalid||this.loading())return;this.loading.set(true);const {email,password}=this.form.getRawValue();this.auth.login(email,password).subscribe({next:()=>{this.loading.set(false);const requested=this.route.snapshot.queryParamMap.get('returnUrl')??'/dashboard';const safe=requested.startsWith('/')&&!requested.startsWith('//')?requested:'/dashboard';void this.router.navigateByUrl(safe);},error:(cause:unknown)=>{this.loading.set(false);const status=cause instanceof HttpErrorResponse?cause.status:0;this.error.set(status===401?'El correo o la contraseña no son correctos.':status===0?'No pudimos conectar con Support Flow. Comprueba que el backend esté iniciado.':'No fue posible iniciar sesión en este momento. Inténtalo de nuevo.');}});}
}
