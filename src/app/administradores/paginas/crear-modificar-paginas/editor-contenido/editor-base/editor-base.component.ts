import { Directive, Input, Output, EventEmitter, OnInit, Type, TemplateRef } from '@angular/core';
import { Contenido } from '../../../../../models/pagina.model';

// Interfaz para dimensiones con unidades
export interface DimensionConfig {
  valor: number;
  unidad: string;
}

// Opciones para las propiedades seleccionables
export const OPCIONES_COMUNES = {
  // Opciones para peso de fuente
  FONT_WEIGHT: [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Negrita' },
    { value: 'bolder', label: 'Más Negrita' },
    { value: 'lighter', label: 'Ligera' },
    { value: '400', label: '400 (Normal)' },
    { value: '500', label: '500 (Medium)' },
    { value: '700', label: '700 (Bold)' }
  ],
  
  // Opciones para estilo de fuente
  FONT_STYLE: [
    { value: 'normal', label: 'Normal' },
    { value: 'italic', label: 'Cursiva' }
  ],
  
  // Opciones para alineación de texto
  TEXT_ALIGN: [
    { value: 'left', label: 'Izquierda' },
    { value: 'center', label: 'Centro' },
    { value: 'right', label: 'Derecha' },
    { value: 'justify', label: 'Justificado' }
  ],
  
  // Unidades disponibles
  UNIDADES: ['px', '%', 'em', 'rem', 'vh', 'vw']
};

@Directive()
export abstract class EditorBaseComponent<T extends Contenido> implements OnInit {
  @Input() contenidoExistente: T | null = null;
  @Output() contenidoCreado = new EventEmitter<T>();

  // Dimensiones con unidades (solo para width y height)
  dimensiones = {
    width: { valor: 100, unidad: '%' },
    height: { valor: 0, unidad: 'auto' }
  };
  
  // Acceso directo a opciones comunes
  readonly unidades = OPCIONES_COMUNES.UNIDADES;
  readonly fontWeightOptions = OPCIONES_COMUNES.FONT_WEIGHT;
  readonly fontStyleOptions = OPCIONES_COMUNES.FONT_STYLE;
  readonly textAlignOptions = OPCIONES_COMUNES.TEXT_ALIGN;

  ngOnInit(): void {
    if (this.contenidoExistente) {
      this.inicializarDesdeContenidoExistente();
    }
  }

  // Método para inicializar propiedades desde un contenido existente
  protected inicializarDesdeContenidoExistente(): void {
    if (this.contenidoExistente?.estilos) {
      // Inicializar dimensiones para width y height
      this.parsearDimensionDesdeEstilo('width');
      this.parsearDimensionDesdeEstilo('height');
    }
  }
  
  // Método abstracto que devuelve el elemento que se está editando
  protected abstract obtenerElementoActual(): T;
  
  // Parsea una propiedad con unidades (width o height)
  protected parsearDimensionDesdeEstilo(propiedad: 'width' | 'height'): void {
    const valor = this.contenidoExistente?.estilos?.[propiedad];
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
  
  // Actualiza el estilo con la unidad seleccionada (para width/height)
  actualizarDimension(propiedad: 'width' | 'height'): void {
    const elemento = this.obtenerElementoActual();
    if (!elemento?.estilos) return;
    
    const dim = this.dimensiones[propiedad];
    elemento.estilos[propiedad] = dim.unidad === 'auto' 
      ? 'auto' 
      : `${dim.valor}${dim.unidad}`;
  }
  
  // Actualiza cualquier propiedad del contenido (usando path en notación de puntos)
  actualizarPropiedad(path: string, valor: any) {
    const elemento = this.obtenerElementoActual();
    if (!elemento) return;
    
    const partes = path.split('.');
    let objetivo = elemento;
    
    // Navegar hasta el objeto padre de la propiedad
    for (let i = 0; i < partes.length - 1; i++) {
      objetivo = objetivo[partes[i]];
      if (!objetivo) return;
    }
    
    // Actualizar la propiedad
    objetivo[partes[partes.length - 1]] = valor;
  }
  
  // Método abstracto para Aplicar cambios
  abstract guardar(): void;
}