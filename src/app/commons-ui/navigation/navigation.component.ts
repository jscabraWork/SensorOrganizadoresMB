import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  @Input() menuItems: { path: string, label: string }[] = [];
  @Input() addButtonLabel: string = 'Agregar';
  
  @Output() onAdd = new EventEmitter<void>();
  @Output() onMenuItemClick = new EventEmitter<void>();

  //Para manejar el estado activo del menú
  @Input() activeState: number = 0;
  @Input() showAddButton: boolean= true;


  
  extender: boolean = true;

  toggleMenu() {
    this.extender = !this.extender;
    this.onMenuItemClick.emit();
  }
}
