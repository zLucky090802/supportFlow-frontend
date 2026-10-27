import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
type SourceStatus='Disponible'|'Procesando'|'Error';
interface SourceDocument {id:number;name:string;type:string;size:string;status:SourceStatus;agents:string[];updated:string;}
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
@Component({selector:'app-documents',imports:[RouterLink,AppSidebarComponent,AppIconComponent],templateUrl:'./documents.component.html',styleUrl:'./documents.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class DocumentsComponent {
 readonly compact=signal(false);readonly query=signal('');readonly status=signal('');readonly selectedId=signal(1);readonly feedback=signal('');readonly uploadError=signal('');
 readonly agentOptions=['Asistente de soporte','Asistente comercial','Asistente de seguimiento'];readonly draftAgents=signal<string[]>([]);
 readonly documents=signal<SourceDocument[]>([
 {id:1,name:'Guía de atención al cliente.pdf',type:'PDF',size:'1,4 MB',status:'Disponible',agents:['Asistente de soporte'],updated:'Hoy, 9:30 a. m.'},
 {id:2,name:'Catálogo de servicios.docx',type:'DOCX',size:'840 KB',status:'Disponible',agents:['Asistente comercial','Asistente de soporte'],updated:'Ayer, 3:10 p. m.'},
 {id:3,name:'Políticas de cambios.pdf',type:'PDF',size:'2,1 MB',status:'Procesando',agents:[],updated:'Hace 2 min'},
 {id:4,name:'Preguntas frecuentes.txt',type:'TXT',size:'24 KB',status:'Error',agents:[],updated:'Hace 10 min'}]);
 readonly filtered=computed(()=>this.documents().filter(doc=>normalize(doc.name).includes(normalize(this.query()))&&(!this.status()||doc.status===this.status())));
 readonly selected=computed<SourceDocument|null>(()=>this.filtered().find(doc=>doc.id===this.selectedId())??this.filtered()[0]??null);
 readonly totals=computed(()=>({ready:this.documents().filter(d=>d.status==='Disponible').length,processing:this.documents().filter(d=>d.status==='Procesando').length,error:this.documents().filter(d=>d.status==='Error').length}));
 readonly descriptions:Record<SourceStatus,string>={Disponible:'Contenido preparado en este ejemplo. Solo los agentes asociados podrían utilizar esta fuente.',Procesando:'Estamos preparando el contenido. En este ejemplo el procesamiento no es real.',Error:'No se pudo preparar el contenido de ejemplo. Revisa que el archivo sea legible y vuelve a intentar.'};
 clearFilters(){this.query.set('');this.status.set('');}
 select(id:number){this.selectedId.set(id);this.feedback.set('');}
 openUpload(dialog:HTMLDialogElement,form:HTMLFormElement){form.reset();this.uploadError.set('');dialog.showModal();}
 addDocument(file:File|undefined,name:string):boolean {
  const trimmed=name.trim();
  if(!file||!trimmed||trimmed.length>100||!(/\.(pdf|docx|txt)$/i.test(file.name))||file.size>10*1024*1024){this.uploadError.set('Revisa el nombre y el formato propuesto: PDF, DOCX o TXT de hasta 10 MB.');return false;}
  const id=Math.max(0,...this.documents().map(d=>d.id))+1;
  this.documents.update(docs=>[...docs,{id,name:trimmed,type:file.name.split('.').pop()!.toUpperCase(),size:Math.round(file.size/1024)+' KB',status:'Procesando',agents:[],updated:'Ahora · Demo'}]);
  this.clearFilters();this.selectedId.set(id);this.uploadError.set('');this.feedback.set('Solo se añadió el nombre al ejemplo. No se leyó ni subió el archivo.');return true;
 }
 upload(event:Event,file:HTMLInputElement,name:HTMLInputElement,dialog:HTMLDialogElement){event.preventDefault();if(this.addDocument(file.files?.[0],name.value))dialog.close();}
 openAssociation(dialog:HTMLDialogElement){this.draftAgents.set([...(this.selected()?.agents??[])]);dialog.showModal();}
 toggleAgent(agent:string,checked:boolean){this.draftAgents.update(list=>checked?[...new Set([...list,agent])]:list.filter(item=>item!==agent));}
 associate(){const selected=this.selected();if(!selected)return;this.documents.update(docs=>docs.map(doc=>doc.id===selected.id?{...doc,agents:[...this.draftAgents()]}:doc));this.feedback.set('Asociación simulada. No se modificó el conocimiento real de ningún agente.');}
 retry(){const selected=this.selected();if(selected?.status!=='Error')return;this.documents.update(docs=>docs.map(doc=>doc.id===selected.id?{...doc,status:'Procesando'}:doc));this.feedback.set('Reintento simulado. No se ejecutó ningún proceso RAG.');}
 remove(){const selected=this.selected();if(!selected)return;this.documents.update(docs=>docs.filter(doc=>doc.id!==selected.id));this.feedback.set('Fuente retirada del ejemplo. El archivo original no se ha modificado.');}
}
