import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HardcodedAutheticationService } from '../../service/hardcoded-authetication.service';
// import { TemporadaDataService } from '../../service/data/temporada-data.service';
// import { Temporada } from '../../models/temporada.model';
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

  // temporadaId:any - Ya no se usa temporada
  // temporada: Temporada - Ya no se usa temporada
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
    // private temporadaService: TemporadaDataService - Ya no se usa
  ) { }

  ngOnInit(): void {
    this.extender = true;
    const rutaCompleta = this.route.snapshot;
    this.nombre = this.autenticado.getAdmin();
    // Ya no se necesita cargar temporada - se usa ruta base eventos
    if (!this.nombre) {
      console.error('Nombre no definido');
    }
  }
  

  extenderMenu(){
    this.extender=!this.extender
  }

  navigateToAgregarEvento() {
    this.router.navigate(['/administradores/admin',this.nombre,'eventos','agregar'
    ]);
  }

  goBack() {
     this.router.navigate(['/administradores/admin', this.nombre]);
  }

}
