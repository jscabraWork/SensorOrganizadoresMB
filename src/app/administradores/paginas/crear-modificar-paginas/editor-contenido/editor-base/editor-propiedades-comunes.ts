import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contenido } from '../../../../../models/pagina.model';
import { OPCIONES_COMUNES } from './editor-base.component';

@Component({
  selector: 'app-editor-propiedades-comunes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor-propiedades-comunes.html',
  styleUrls: ['../editor-contenido.component.scss']
})
export class EditorPropiedadesComunesComponent implements OnInit, OnChanges {
  
    @Input() contenido: any;
  
  // Dimensiones con unidades (solo para width y height)
  dimensiones = {
    width: { valor: 100, unidad: '%' },
    height: { valor: 0, unidad: 'auto' }
  };
  
  // Opciones disponibles
  readonly unidades = OPCIONES_COMUNES.UNIDADES;

  marginVerticalAuto = false;
  marginHorizontalAuto = false;
  
  ngOnInit() {
    this.inicializarDimensiones();
  }
  
  ngOnChanges(changes: SimpleChanges) {
  if (changes['contenido']) {
    this.inicializarDimensiones();
  }
}

  
  // Inicializa las dimensiones con unidades desde el modelo
  inicializarDimensiones() {
    if (!this.contenido || !this.contenido.estilos) return;
    
    this.parsearDimensionDesdeEstilo('width');
    this.parsearDimensionDesdeEstilo('height');
  }
  
  // Parsea una propiedad con unidades (width o height)
  parsearDimensionDesdeEstilo(propiedad: 'width' | 'height'): void {
    const valor = this.contenido?.estilos?.[propiedad];
    if (!valor) return;
    
    if (valor === 'auto') {
      this.dimensiones[propiedad] = { valor: 0, unidad: 'auto' };
      return;
    }
    
    const match = valor.match(/^(\d+)(px|%|em|rem|vh|vw)$/);
    if (match) {
      this.dimensiones[propiedad] = {
        valor: parseInt(match[1], 10),
        unidad: match[2]
      };
    }
  }
  
  // Actualiza el valor de una dimensión (width o height)
  actualizarValorDimension(propiedad: 'width' | 'height', valor: number) {
    this.dimensiones[propiedad].valor = valor;
    this.actualizarDimension(propiedad);
  }
  
  // Actualiza la unidad de una dimensión (width o height)
  actualizarUnidadDimension(propiedad: 'width' | 'height', unidad: string) {
    this.dimensiones[propiedad].unidad = unidad;
    this.actualizarDimension(propiedad);
  }
  
  // Actualiza la dimensión completa en el modelo
  actualizarDimension(propiedad: 'width' | 'height'): void {
    if (!this.contenido || !this.contenido.estilos) return;
    
    const dim = this.dimensiones[propiedad];
    this.contenido.estilos[propiedad] = dim.unidad === 'auto' 
      ? 'auto' 
      : `${dim.valor}${dim.unidad}`;
  }
  
  // Actualiza cualquier propiedad del contenido (usando path en notación de puntos)
  actualizarPropiedad(path: string, valor: any) {
    if (!this.contenido) return;
    
    const partes = path.split('.');
    let objetivo = this.contenido;
    
    // Navegar hasta el objeto padre de la propiedad
    for (let i = 0; i < partes.length - 1; i++) {
      objetivo = objetivo[partes[i]];
      if (!objetivo) return;
    }
    
    // Actualizar la propiedad
    objetivo[partes[partes.length - 1]] = valor;
  }


  toggleMarginVerticalAuto(): void {
    this.marginVerticalAuto = !this.marginVerticalAuto;
    
    if (!this.contenido || !this.contenido.estilos) return;
    
    if (this.marginVerticalAuto) {
      // Si se activa el modo automático, establecer los márgenes verticales como nulos
      this.contenido.estilos.marginTop = null;
      this.contenido.estilos.marginBottom = null;
    } else {
      // Si se desactiva, establecer valores predeterminados
      this.contenido.estilos.marginTop = 0;
      this.contenido.estilos.marginBottom = 0;
    }
  }
  
  // Activa/desactiva el modo automático para márgenes horizontales
  toggleMarginHorizontalAuto(): void {
    this.marginHorizontalAuto = !this.marginHorizontalAuto;
    
    if (!this.contenido || !this.contenido.estilos) return;
    
    if (this.marginHorizontalAuto) {
      // Si se activa el modo automático, establecer los márgenes horizontales como nulos
      this.contenido.estilos.marginLeft = null;
      this.contenido.estilos.marginRight = null;
    } else {
      // Si se desactiva, establecer valores predeterminados
      this.contenido.estilos.marginLeft = 0;
      this.contenido.estilos.marginRight = 0;
    }
  }
  
}