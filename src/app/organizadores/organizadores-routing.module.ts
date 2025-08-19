import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizadoresComponent } from './organizadores.component';
import { HomeOrganizadorComponent } from './home-organizador/home-organizador.component';
import { RouteGuardOrganizadorService } from '../service/route-guard-organizador.service';
import { EventosComponent } from './eventos/eventos.component';
import { EventoPerfilComponent } from './eventos/evento-perfil/evento-perfil.component';
import { ResumenComponent } from './eventos/evento-perfil/resumen/resumen.component';
import { DetalleComponent } from './eventos/evento-perfil/detalle/detalle.component';
import { HistorialComponent } from './eventos/evento-perfil/historial/historial.component';
import { AlcanciasComponent } from './eventos/evento-perfil/alcancias/alcancias.component';
import { TaquillasComponent } from './eventos/evento-perfil/taquillas/taquillas.component';
import { IngresosComponent } from './eventos/evento-perfil/ingresos/ingresos.component';
import { PromotoresComponent } from './eventos/evento-perfil/promotores/promotores.component';

const routes: Routes = [
  {
    path: 'organizador/:idOrganizador',
    component: OrganizadoresComponent,
    canActivate: [RouteGuardOrganizadorService],
    children: [
      {
        path: '',
        component: HomeOrganizadorComponent,
      },
      {
        path: 'eventos',
        component: EventosComponent

      },
      {
        path: 'historial',
        component: EventosComponent
      },
      {
        path: 'reporte/:idEvento',
        component: EventoPerfilComponent,
        children: [
          { path: 'resumen', component: ResumenComponent },
          {
            path: 'detalle',
            component: DetalleComponent
          },
          {
            path: 'historial',
            component: HistorialComponent
          },
          {
            path: 'alcancias',
            component: AlcanciasComponent
          },
          {
            path: 'promotores',
            component: PromotoresComponent
          },
          {
            path: 'taquilla',
            component: TaquillasComponent
          },
          {
            path: 'ingresos',
            component: IngresosComponent
          },
          {
            path: '',
            redirectTo: 'resumen',
            pathMatch: 'full'
          },
          
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizadoresRoutingModule { }