import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { ARTICLES, CATEGORIES, Article, ArticleStatus } from './knowledge.data';
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
@Component({selector:'app-knowledge-base',imports:[RouterLink,AppSidebarComponent,AppIconComponent],templateUrl:'./knowledge-base.component.html',styleUrl:'./knowledge-base.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class KnowledgeBaseComponent {
 readonly editorAvailable=true;
 readonly compact=signal(false);
 readonly categories=CATEGORIES;
 readonly tabs:readonly {label:string;value:'Todos'|ArticleStatus;count:number}[]=[{label:'Todos',value:'Todos',count:6},{label:'Publicados',value:'Publicado',count:4},{label:'Borradores',value:'Borrador',count:2}];
 readonly filter=signal<'Todos'|ArticleStatus>('Todos');
 readonly query=signal('');
 readonly category=signal('');
 readonly selectedId=signal('0');
 readonly viewState=signal('ready');
 readonly filtered=computed(()=>ARTICLES.filter(a=>(this.filter()==='Todos'||a.status===this.filter())&&normalize(a.title).includes(normalize(this.query()))&&(!this.category()||a.category===this.category())));
 readonly selected=computed<Article|null>(()=>this.filtered().find(a=>a.id===this.selectedId())??this.filtered()[0]??null);
 readonly stateTitle=computed(()=>({empty:'Tu base de conocimiento empieza aquí',loading:'Cargando artículos…',error:'No pudimos cargar los artículos'}[this.viewState()]??''));
 readonly stateDescription=computed(()=>({empty:'Crea tu primer artículo para reunir las respuestas de tu equipo.',loading:'Estamos preparando el contenido. Este es un estado de ejemplo.',error:'Comprueba tu conexión e inténtalo de nuevo. Este es un estado de ejemplo.'}[this.viewState()]??''));
 clearFilters(){this.query.set('');this.category.set('');this.filter.set('Todos');}
}

