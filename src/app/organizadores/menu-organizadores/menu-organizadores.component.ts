import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-organizadores.component.html',
  styleUrl: './menu-organizadores.component.scss'
})
export class MenuOrganizadoresComponent implements OnInit {
  @Input() id: string = '';
  
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
      { route: `/organizadores/organizador/${this.id}`, icon: 'assets/images/vector/dashboard.svg', label: 'Home' },
      { route: `/organizadores/organizador/${this.id}/eventos`, icon: 'assets/images/vector/temporadas.png', label: 'Eventos' },
      { route: `/organizadores/organizador/${this.id}/historial`, icon: 'assets/images/vector/usuarios.png', label: 'Historial' },
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
