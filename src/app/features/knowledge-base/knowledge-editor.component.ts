import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { ARTICLES, CATEGORIES } from './knowledge.data';
const nonBlank:ValidatorFn=control=>String(control.value??'').trim()?null:{blank:true};
@Component({selector:'app-knowledge-editor',imports:[ReactiveFormsModule,RouterLink,AppSidebarComponent,AppIconComponent],templateUrl:'./knowledge-editor.component.html',styleUrl:'./knowledge-editor.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class KnowledgeEditorComponent {
 private readonly builder=inject(FormBuilder);
 private readonly route=inject(ActivatedRoute);
 readonly publishDialog=viewChild<ElementRef<HTMLDialogElement>>('publishDialog');
 readonly compact=signal(false);
 readonly categories=CATEGORIES;
 readonly editing=signal(false);
 readonly missing=signal(false);
 readonly status=signal('Borrador');
 readonly feedback=signal('');
 readonly form=this.builder.nonNullable.group({title:['',[Validators.required,Validators.maxLength(120),nonBlank]],category:['Información general',[Validators.required]],content:['',[Validators.required,Validators.maxLength(6000),nonBlank]]});
 constructor(){
  this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(params=>{
   const id=params.get('id');const article=ARTICLES.find(item=>item.id===id);
   this.editing.set(id!==null);this.missing.set(id!==null&&!article);this.status.set(article?.status??'Borrador');
   this.form.reset({title:article?.title??'',category:article?.category??'Información general',content:article?.content??''});this.feedback.set('');
   this.publishDialog()?.nativeElement.close();
  });
  this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(()=>this.feedback.set(''));
 }
 private valid(){this.form.markAllAsTouched();return !this.missing()&&this.form.valid;}
 saveDraft(){if(!this.valid())return;this.status.set('Borrador · Demo');this.feedback.set('Borrador guardado de forma simulada. No se conserva al recargar ni actualiza la base real.');}
 requestPublish(){if(this.valid())this.publishDialog()?.nativeElement.showModal();}
 publish(){if(!this.valid())return;this.status.set('Publicado · Demo');this.feedback.set('Publicación simulada. No se modificó la base de conocimiento real.');this.publishDialog()?.nativeElement.close();}
}

