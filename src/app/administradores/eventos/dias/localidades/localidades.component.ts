import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HardcodedAutheticationService } from '../../../../service/hardcoded-authetication.service';
import { DiaDataService } from '../../../../service/data/dia-data.service';
import { Dia } from '../../../../models/dia.model';
import { Evento } from '../../../../models/evento.model';
import { EventoDataService } from '../../../../service/data/evento-data.service';

@Component({
  selector: 'app-localidades',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './localidades.component.html',
  styleUrl: './localidades.component.scss'
})
export class LocalidadesComponent implements OnInit {

  eventoId: number;
  temporadaId: number;
  diaId: number | null = null;
  dia: Dia;
  evento: Evento;
  extender: boolean = true;
  nombre: string;
  esRutaPorEvento: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autenticado: HardcodedAutheticationService,
    private diaService: DiaDataService,
    private eventoService: EventoDataService
  ) { }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin();
    this.temporadaId = Number(this.route.snapshot.paramMap.get('idTemporada'));
    this.eventoId = Number(this.route.snapshot.paramMap.get('idEvento'));
    this.diaId = this.route.snapshot.paramMap.has('idDia') 
      ? Number(this.route.snapshot.paramMap.get('idDia')) 
      : null;

    this.esRutaPorEvento = this.diaId === null;

    if (this.esRutaPorEvento) {
      this.eventoService.getPorId(this.eventoId).subscribe({
        next: (data) => {
          this.evento = data;
        },
        error: (error) => {
          console.error('Error al buscar los datos del evento', error);
        }
      });
    } else {
      this.diaService.getPorId(this.diaId).subscribe({
        next: (data) => {
          this.dia = data;
        },
        error: (error) => {
          console.error('Error al buscar los datos del día', error);
        }
      });
    }

    if (!this.eventoId || !this.nombre || !this.temporadaId) {
      console.error('Datos no identificados');
    }
  }

  extenderMenu() {
    this.extender = !this.extender;
  }

  navigateToAgregarLocalidad() {
  const baseRuta = [
    '/administradores/admin', this.nombre,
    'temporada', this.temporadaId,
    'evento', this.eventoId
  ];

  const ruta = this.esRutaPorEvento
    ? [...baseRuta, 'localidades', 'agregar']
    : [...baseRuta, 'dia', this.diaId, 'localidades', 'agregar'];

  this.router.navigate(ruta);
}

  goBack() {
    if (this.esRutaPorEvento) {
      this.router.navigate([
        '/administradores', 'admin', this.nombre, 'temporada', this.temporadaId, 'eventos'
      ]);
    } else {
      this.router.navigate([
        '/administradores', 'admin', this.nombre, 'temporada', this.temporadaId, 'evento', this.eventoId, 'dias'
      ]);
    }
  }

}
