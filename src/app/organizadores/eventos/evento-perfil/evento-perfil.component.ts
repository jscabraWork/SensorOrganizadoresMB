import { Evento } from './../../../models/evento.model';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { NavegacionOrganizadorComponent } from '../../iu/navegacion-organizador/navegacion-organizador.component';
import { CommonModule } from '@angular/common';
import { ReporteDataService } from '../../../service/data/reporte-data.service';

@Component({
  selector: 'app-evento-perfil',
  standalone: true,
  imports: [RouterOutlet, NavegacionOrganizadorComponent, CommonModule],
  templateUrl: './evento-perfil.component.html',
  styleUrl: './evento-perfil.component.scss'
})
export class EventoPerfilComponent implements OnInit {
  idEvento: string = '';
  idOrganizador: string = '';
  evento: Evento | null = null;

  menuItems = [
    { path: 'resumen', label: 'Resumen' },
    { path: 'detalle', label: 'Detalle' },
    { path: 'historial', label: 'Historial' },
    { path: 'alcancias', label: 'Alcancias' },
    { path: 'promotores', label: 'Promotores' },
    { path: 'taquilla', label: 'Taquilla' }
  ];

  constructor(private route: ActivatedRoute, private router: Router, private service: ReporteDataService) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.idEvento = params['idEvento'];
    });

    this.route.parent?.parent?.params.subscribe(params => {
      this.idOrganizador = params['idOrganizador'];
    });

    this.service.getEventoById(this.idEvento).subscribe(evento => {
      console.log(evento);
      this.evento = evento;
    });
  }

  onMenuItemClick() {
    // Handle menu item click if needed
  }
}
