import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navegacion-organizador',
  imports: [CommonModule, RouterModule],
  templateUrl: './navegacion-organizador.component.html',
  styleUrl: './navegacion-organizador.component.scss'
})
export class NavegacionOrganizadorComponent {
  @Input() menuItems: { path: string, label: string }[] = [];
  
  @Output() onMenuItemClick = new EventEmitter<void>();

  //Para manejar el estado activo del menú
  @Input() activeState: number = 0;


  extender: boolean = true;

  toggleMenu() {
    this.extender = !this.extender;
    this.onMenuItemClick.emit();
  }
}
