import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-admin.component.html',
  styleUrl: './menu-admin.component.scss'
})
export class MenuAdminComponent implements OnInit {
  @Input() nombre: string = '';
  isCollapsed = false;
  isMobile = false;
  
  navItems: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() { 
    this.checkScreenSize();
    this.updateNavItems();
  }

  ngOnChanges() {
    this.updateNavItems();
  }

  private updateNavItems() {
    this.navItems = [
      { route: `/administradores/admin/${this.nombre}/temporadas`, icon: 'assets/images/vector/temporadas.png', label: 'Temporadas' },
      { route: `/administradores/admin/${this.nombre}/usuarios`, icon: 'assets/images/vector/usuarios.png', label: 'Usuarios' },
      { route: `/administradores/admin/${this.nombre}/ciudades`, icon: 'assets/images/vector/ciudades.png', label: 'Ciudades' },
      { route: '', icon: 'assets/images/vector/calendario.png', label: 'Calendario' },
      { route: `/administradores/admin/${this.nombre}/transacciones`, icon: 'assets/images/vector/transacciones.png', label: 'Transacciones' },
      { route: '', icon: 'assets/images/vector/alcancias.png', label: 'Alcancias' },
      { route: `/administradores/admin/${this.nombre}/paginas`, icon: 'assets/images/vector/paginas.png', label: 'Paginas' },
      { route: `/administradores/admin/${this.nombre}/mapas`, icon: 'assets/images/vector/mapa.svg', label: 'Mapas' },
      { route: `/administradores/admin/${this.nombre}/promotores`, icon: 'assets/images/vector/promotor.svg', label: 'Promotores' },
      { route: `/administradores/admin/${this.nombre}/puntosfisicos`, icon: 'assets/images/vector/puntofisico.svg', label: 'Puntos Físicos' },
      { route: '', icon: 'assets/images/vector/informes.png', label: 'Informes' },
      { route: '/logout', icon: 'assets/images/vector/logout.svg', label: 'Cerrar Sesión', isLogout: true }
    ];
  }

  @HostListener('window:resize') onResize() { this.checkScreenSize(); }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) this.isCollapsed = true;
  }

  toggleSidebar() { this.isCollapsed = !this.isCollapsed; }
  closeSidebar() { if (this.isMobile) this.isCollapsed = true; }
}
