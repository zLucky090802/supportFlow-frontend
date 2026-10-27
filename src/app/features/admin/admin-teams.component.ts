import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminDemoStore, AdminTeam } from './admin-demo.store';
import { AdminShellComponent } from './admin-shell.component';
@Component({selector:'app-admin-teams',imports:[AdminShellComponent,ReactiveFormsModule],templateUrl:'./admin-teams.component.html',styleUrls:['./admin-shared.scss','./admin-teams.component.scss'],changeDetection:ChangeDetectionStrategy.OnPush})
export class AdminTeamsComponent {
  readonly store=inject(AdminDemoStore);readonly editingId=signal<string|null>(null);readonly error=signal('');readonly feedback=signal('');
  readonly dialog=viewChild.required<ElementRef<HTMLDialogElement>>('teamDialog');
  readonly form=new FormGroup({name:new FormControl('',{nonNullable:true,validators:[Validators.required,Validators.maxLength(60)]}),description:new FormControl('',{nonNullable:true,validators:[Validators.maxLength(180)]})});
  open(team?:AdminTeam):void {this.editingId.set(team?.id??null);this.error.set('');this.form.reset({name:team?.name??'',description:team?.description??''});this.dialog().nativeElement.showModal();}
  save():void {
    this.form.markAllAsTouched();if(this.form.invalid){this.error.set('Revisa el nombre y la descripción del equipo.');return;}
    const {name,description}=this.form.getRawValue();const error=this.store.saveTeam(this.editingId(),name,description);
    if(error){this.error.set(error);return;}
    this.feedback.set('Equipo guardado como ejemplo. No se creó ni modificó un equipo real.');this.dialog().nativeElement.close();
  }
}
