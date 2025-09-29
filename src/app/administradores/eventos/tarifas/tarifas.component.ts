import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HardcodedAutheticationService } from '../../../service/hardcoded-authetication.service';
import { LocalidadDataService } from '../../../service/data/localidad-data.service';
import { Localidad } from '../../../models/localidad.model';
import { TitleComponent } from '../../../commons-ui/title/title.component';
import { NavigationComponent } from '../../../commons-ui/navigation/navigation.component';

@Component({
  selector: 'app-tarifas',
  imports: [
    CommonModule,
    RouterModule,
    TitleComponent,
    NavigationComponent
  ],
  templateUrl: './tarifas.component.html',
  styleUrl: './tarifas.component.scss'
})
export class TarifasComponent implements OnInit {

  eventoId:any
  // temporadaId:any // Eliminado porque ya no se usa temporada
  diaId: any
  localidadId: any
  localidad: Localidad
  nombre: string
  esRutaPorEvento: boolean;
  
  menuItems = [
    { path: 'activas', label: 'Tarifas Activas' },
    { path: 'inactivas', label: 'Tarifas Inactivas' },
    { path: 'cupones-activos', label: 'Tarifas de Cupones' },
    { path: 'soldout', label: 'Sold Out' },
    { path: 'punto-fisico', label: 'Tarifas de Punto Físico' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autenticado: HardcodedAutheticationService,
    private localidadService: LocalidadDataService
  ) { }

  ngOnInit(): void {
    const rutaCompleta = this.route.snapshot;
    this.nombre = this.autenticado.getAdmin();
    // this.temporadaId = Number(rutaCompleta.paramMap.get('idTemporada')); // Ya no se usa temporada
    this.eventoId = Number(rutaCompleta.paramMap.get('idEvento'));
    this.diaId = rutaCompleta.paramMap.has('idDia') 
      ? Number(rutaCompleta.paramMap.get('idDia')) 
      : null;
    this.localidadId = Number(rutaCompleta.paramMap.get('idLocalidad'));

    this.esRutaPorEvento = this.diaId === null;

    if (this.eventoId && this.nombre && this.localidadId) {
      this.localidadService.getPorId(this.localidadId).subscribe({
        next: (data) => {
          this.localidad = data;
        },
        error: (error) => {
          console.error('Error al buscar localidad:', error);
        }
      });
    } else {
      console.error('Faltan parámetros en la ruta');
    }
  }

  onAddTarifa() {
    if (this.esRutaPorEvento) {
      this.router.navigate([
        '/administradores/admin', this.nombre,
        'evento', this.eventoId,
        'localidades', this.localidadId,
        'tarifas', 'agregar'
      ]);
    } else {
      this.router.navigate([
        '/administradores/admin', this.nombre,
        'evento', this.eventoId,
        'dia', this.diaId,
        'localidades', this.localidadId,
        'tarifas', 'agregar'
      ]);
    }
  }

  onBack() {
    if (this.esRutaPorEvento) {
      this.router.navigate([
        '/administradores/admin', this.nombre,
        'evento', this.eventoId,
        'localidades'
      ]);
    } else {
      this.router.navigate([
        '/administradores/admin', this.nombre,
        'evento', this.eventoId,
        'dia', this.diaId,
        'localidades'
      ]);
    }
  }
}
