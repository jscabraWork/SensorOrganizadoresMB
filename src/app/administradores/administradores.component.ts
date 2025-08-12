import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MenuAdminComponent } from './menu-admin/menu-admin.component';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-administradores',
  imports: [
    CommonModule,
    MenuAdminComponent,
    RouterOutlet
  ],
  templateUrl: './administradores.component.html',
  styleUrl: './administradores.component.scss'
})
export class AdministradoresComponent implements OnInit {
  nombre: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.nombre = params['nombre'];
    });
  }
}
