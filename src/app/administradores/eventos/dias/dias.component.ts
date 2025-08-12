import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Evento } from '../../../models/evento.model';
import { HardcodedAutheticationService } from '../../../service/hardcoded-authetication.service';
import { EventoDataService } from '../../../service/data/evento-data.service';

@Component({
  selector: 'app-dias',
  imports: [
      CommonModule,
      RouterModule,
      FormsModule
    ],
  templateUrl: './dias.component.html',
  styleUrl: './dias.component.scss'
})
export class DiasComponent implements OnInit {

  eventoId:any
  temporadaId:any
  evento: Evento
  extender: boolean
  nombre: string

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autenticado: HardcodedAutheticationService,
    private eventoService: EventoDataService
  ) { }

  ngOnInit(): void {
    this.extender = true
    const rutaCompleta = this.route.snapshot;
    this.nombre = this.autenticado.getAdmin();
    this.temporadaId = Number(rutaCompleta.paramMap.get('idTemporada'));
    this.eventoId = Number(rutaCompleta.paramMap.get('idEvento'));
    if(this.eventoId && this.nombre && this.temporadaId) {
      this.eventoService.getPorId(this.eventoId).subscribe({
        next: (data) => {
          this.evento = data;
        },
        error: (error) => {
          console.error('Error al buscar evento:', error);
        }
      })
    } else {
      console.error('Nombre o eventoId no definidos');
    }
  }

  extenderMenu(){
    this.extender=!this.extender
  }

  navigateToAgregarDia() {
    this.router.navigate(['/administradores/admin',this.nombre,'temporada',this.temporadaId,'evento',this.eventoId,'dias', 'agregar'
    ]);
  }

  goBack() {
    this.router.navigate(['/administradores/admin',this.nombre,'temporada',this.temporadaId,'eventos'
    ]);
  }
}
