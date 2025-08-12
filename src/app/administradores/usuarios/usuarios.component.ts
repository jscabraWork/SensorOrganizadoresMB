import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TitleComponent } from '../../commons-ui/title/title.component';
import { NavigationComponent } from '../../commons-ui/navigation/navigation.component';
import { HardcodedAutheticationService } from '../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-usuarios',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TitleComponent,
    NavigationComponent
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {

  nombre:string
  extender:boolean
  
  menuItems = [
    { path: 'clientes', label: 'Clientes' },
    { path: 'organizadores', label: 'Organizadores' },
    { path: 'coordinadores', label: 'Coordinadores' },
    { path: 'analistas', label: 'Analistas' },
    { path: 'promotores', label: 'Promotores' },
    { path: 'puntosfisicos', label: 'Puntos Físicos' },
    { path: 'auditores', label: 'Auditores' },
    { path: 'administradores', label: 'Administradores' }
  ];

  constructor(
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

  navigateToAgregarUsuario() {
    this.router.navigate(['/administradores/admin', this.nombre, 'usuarios', 'agregar']);
  }

  goBack() {
    this.router.navigate(['/administradores/admin', this.nombre]);
  }

}
