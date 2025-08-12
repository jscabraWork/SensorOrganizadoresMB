import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Leyenda } from '../../../../models/mapas/leyenda.model';

@Component({
  selector: 'app-leyendas-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leyendas-mapa.component.html',
  styleUrls: ['./leyendas-mapa.component.scss']
})
export class LeyendasMapaComponent {
  @Input() leyendas: Leyenda[] = [];
  @Output() leyendasChange = new EventEmitter<Leyenda[]>();

  nuevaLeyenda: Leyenda = new Leyenda();

  agregarLeyenda() {
    if (!this.nuevaLeyenda.label.trim() || !this.nuevaLeyenda.color || this.nuevaLeyenda.precio == null) return;
    this.leyendas.push({ ...this.nuevaLeyenda });
    this.leyendasChange.emit(this.leyendas);
    this.nuevaLeyenda = new Leyenda();
  }

  eliminarLeyenda(index: number) {
    this.leyendas.splice(index, 1);
    this.leyendasChange.emit(this.leyendas);
  }
}
