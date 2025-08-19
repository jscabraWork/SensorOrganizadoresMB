import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { OrganizadoresRoutingModule } from './organizadores-routing.module';
import { OrganizadoresComponent } from './organizadores.component';
import { HomeOrganizadorComponent } from './home-organizador/home-organizador.component';
import { MenuOrganizadoresComponent } from './menu-organizadores/menu-organizadores.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    OrganizadoresRoutingModule,
    OrganizadoresComponent,
    HomeOrganizadorComponent,
    MenuOrganizadoresComponent
  ],
  exports: [
    OrganizadoresComponent
  ]
})
export class OrganizadoresModule { }