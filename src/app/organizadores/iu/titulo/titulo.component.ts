import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-titulo',
  imports: [CommonModule],
  templateUrl: './titulo.component.html',
  styleUrl: './titulo.component.scss'
})
export class TituloComponent {
  @Input() titulo: string = '';
  @Input() mostrarLinea: boolean = true;
  @Input() centrado: boolean = false;
}