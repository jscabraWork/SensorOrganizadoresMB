import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Localidad } from '../../../../../models/localidad.model';
import { TitleComponent } from '../../../../../commons-ui/title/title.component';
import { NavigationComponent } from '../../../../../commons-ui/navigation/navigation.component';
import { LocalidadDataService } from '../../../../../service/data/localidad-data.service';
import { HardcodedAutheticationService } from '../../../../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-tickets',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TitleComponent,
    NavigationComponent
  ],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss'
})
export class TicketsComponent implements OnInit {

  eventoId: number;
  temporadaId: number;
  localidadId: number;
  diaId: number | null;
  localidad: Localidad;
  extender: boolean;
  nombre: string;
  esRutaPorEvento: boolean;

  menuItems = [
    { path: 'vendidos', label: 'Vendidos' },
    { path: 'disponibles', label: 'Disponibles' },
    { path: 'reservados', label: 'Reservados' },
    { path: 'proceso', label: 'En Proceso' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localidadService: LocalidadDataService,
    private autenticado: HardcodedAutheticationService,
  ) { }

  ngOnInit(): void {
    this.extender = true;
    const rutaCompleta = this.route.snapshot;
    this.nombre = this.autenticado.getAdmin();
    this.temporadaId = Number(rutaCompleta.paramMap.get('idTemporada'));
    this.eventoId = Number(rutaCompleta.paramMap.get('idEvento'));
    this.diaId = rutaCompleta.paramMap.has('idDia')
      ? Number(rutaCompleta.paramMap.get('idDia'))
      : null;
    this.localidadId = Number(rutaCompleta.paramMap.get('idLocalidad'));
    this.localidadService.getPorIdPagos(this.localidadId).subscribe({
      next: (response) => {
        this.localidad = response
      }
    })
    // Determinar si es ruta por evento (sin día)
    this.esRutaPorEvento = this.diaId === null;
  }

  extenderMenu() {
    this.extender = !this.extender
  }

  navigateToAgregarTicket() {
    if (this.esRutaPorEvento) {
      // Ruta SIN día (por evento)
      this.router.navigate([
        '/administradores', 'admin', this.nombre,
        'temporada', this.temporadaId,
        'evento', this.eventoId,
        'localidad', this.localidadId,
        'tickets', 'agregar'
      ]);
    } else {
      // Ruta CON día
      this.router.navigate([
        '/administradores', 'admin', this.nombre,
        'temporada', this.temporadaId,
        'evento', this.eventoId,
        'dia', this.diaId,
        'localidad', this.localidadId,
        'tickets', 'agregar'
      ]);
    }
  }

  goBack() {
    if (this.esRutaPorEvento) {
      // Volver a localidades SIN día
      this.router.navigate([
        '/administradores', 'admin', this.nombre,
        'temporada', this.temporadaId,
        'evento', this.eventoId,
        'localidades'
      ]);
    } else {
      // Volver a localidades CON día
      this.router.navigate([
        '/administradores', 'admin', this.nombre,
        'temporada', this.temporadaId,
        'evento', this.eventoId,
        'dia', this.diaId,
        'localidades'
      ]);
    }
  }
}
