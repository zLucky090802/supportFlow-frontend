import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ValidatorFn } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccessShellComponent } from './access-shell.component';
const matching:ValidatorFn=control=>control.get('password')?.value===control.get('confirmation')?.value?null:{mismatch:true};
@Component({selector:'app-reset-access',imports:[AccessShellComponent,ReactiveFormsModule,RouterLink],styleUrl:'./access-form.scss',changeDetection:ChangeDetectionStrategy.OnPush,template:`<app-access-shell><h2>Una nueva contraseña</h2><p class="subtitle">Elige una contraseña para volver a entrar a tu cuenta.</p>@if(!done()){<form [formGroup]="form" (ngSubmit)="submit()" novalidate><label class="field">Nueva contraseña<input type="password" formControlName="password" autocomplete="off" placeholder="Valor ficticio de al menos 8 caracteres"><small>Mínimo de 8 caracteres propuesto; política pendiente de validar.</small></label><label class="field">Confirmar contraseña<input type="password" formControlName="confirmation" autocomplete="off"></label>@if(form.touched && form.invalid){<p class="error" role="alert">{{form.hasError('mismatch') ? 'Las contraseñas no coinciden.' : 'Completa ambos campos con al menos 8 caracteres.'}}</p>}<button class="primary">Guardar contraseña · Demo</button></form>}@else{<div class="result" role="status">Contraseña actualizada de forma simulada. No se guardó ni envió ningún valor.<br><a routerLink="/login">Volver a iniciar sesión →</a></div>}</app-access-shell>`})
export class ResetAccessComponent {
 readonly form=inject(FormBuilder).nonNullable.group({password:['',[Validators.required,Validators.minLength(8)]],confirmation:['',Validators.required]},{validators:matching});readonly done=signal(false);
 submit(){this.form.markAllAsTouched();if(this.form.invalid)return;this.form.reset();this.done.set(true);}
}
