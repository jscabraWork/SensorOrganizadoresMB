import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleComponent } from '../../commons-ui/title/title.component';
import { NavigationComponent } from '../../commons-ui/navigation/navigation.component';
import { HardcodedAutheticationService } from '../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-temporadas',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TitleComponent,
    NavigationComponent
  ],
  templateUrl: './temporadas.component.html',
  styleUrl: './temporadas.component.scss'
})
export class TemporadasComponent implements OnInit {

  nombre:string
  extender:boolean
  
  menuItems = [
    { path: 'activas', label: 'Temporadas Activas' },
    { path: 'inactivas', label: 'Temporadas Inactivas' }
  ];

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private autenticado: HardcodedAutheticationService,
  ) { }

  ngOnInit(): void {
    this.extender = true
    this.nombre = this.autenticado.getAdmin()
  }

  extenderMenu(){
    this.extender=!this.extender
  }

  navigateToAgregarTemporada() {
    this.router.navigate(['/administradores/admin', this.nombre, 'temporadas', 'agregar']);
  }

  goBack() {
    this.router.navigate(['/administradores/admin', this.nombre]);
  }

}
