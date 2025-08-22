import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface EstadisticaCard {
  titulo: string;
  valor: string | number;
  tipo?: 'default' | 'highlight' | 'negative' | 'primary';
}

@Component({
  selector: 'app-estadisticas-cards',
  imports: [CommonModule],
  templateUrl: './estadisticas-cards.component.html',
  styleUrl: './estadisticas-cards.component.scss'
})
export class EstadisticasCardsComponent {
  @Input() estadisticas: EstadisticaCard[] = [];
  @Input() cargando: boolean = false;
}