import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HardcodedAutheticationService } from '../../service/hardcoded-authetication.service';
import { TemporadaDataService } from '../../service/data/temporada-data.service';
import { Temporada } from '../../models/temporada.model';
import { TitleComponent } from '../../commons-ui/title/title.component';
import { NavigationComponent } from '../../commons-ui/navigation/navigation.component';

@Component({
  selector: 'app-eventos',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TitleComponent,
    NavigationComponent
  ],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.scss'
})
export class EventosComponent implements OnInit {

  temporadaId:any
  temporada: Temporada
  extender:boolean
  nombre:any

  menuItems = [
    { path: 'creados', label: 'Creados' },
    { path: 'visibles', label: 'Visibles' },
    { path: 'ocultos', label: 'Ocultos' },
    { path: 'terminados', label: 'Terminados' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autenticado: HardcodedAutheticationService,
    private temporadaService: TemporadaDataService
  ) { }

  ngOnInit(): void {
    this.extender = true;
    const rutaCompleta = this.route.snapshot;
    this.nombre = this.autenticado.getAdmin();
    this.temporadaId = Number(rutaCompleta.paramMap.get('idTemporada'));
    if (this.temporadaId && this.nombre) {
      this.temporadaService.getPorId(this.temporadaId).subscribe({
        next: (data) => {
          this.temporada = data;
        },
        error: (err) => {
          console.error('Error al buscar temporada:', err);
        }
      });
    } else {
      console.error('Nombre o temporadaId no definidos');
    }
  }
  

  extenderMenu(){
    this.extender=!this.extender
  }

  navigateToAgregarEvento() {
    this.router.navigate(['/administradores/admin',this.nombre,'temporada',this.temporadaId,'eventos','agregar'
    ]);
  }

  goBack() {
     this.router.navigate(['/administradores/admin', this.nombre, 'temporadas']);
  }

}
