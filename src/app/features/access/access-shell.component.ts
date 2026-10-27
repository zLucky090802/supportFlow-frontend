import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({selector:'app-access-shell',imports:[RouterLink],template:`
<div class="auth-page"><header><a routerLink="/login" class="brand"><span class="mark" aria-hidden="true"><i></i><i></i></span>supportflow</a></header>
<main><section class="story"><div><p class="eyebrow">UNA ATENCIÓN MÁS CERCANA</p><h1>Tu equipo conectado.<br>Tus clientes, acompañados.</h1><p>Un espacio tranquilo para conversar, colaborar y encontrar la respuesta correcta.</p></div><p class="caption">Personas que conectan. Equipos que acompañan.</p></section>
<section class="card"><p class="small-label">BIENVENIDO A SUPPORT FLOW</p><ng-content /><p class="foot">Demostración · Usa datos ficticios.<br>No se guardan ni se envían credenciales.</p></section></main></div>`,styleUrl:'./access-shell.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class AccessShellComponent {}
