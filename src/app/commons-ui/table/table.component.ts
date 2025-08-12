import { CommonModule, CurrencyPipe, DatePipe, ViewportScroller } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface TablaBotonConfig {
  texto: string;
  clase: string;
  accion: (item: any) => void;
  columna?: string;
}

export interface ColumnaBotonConfig {
  columna: string; // nombre de la columna
  texto: string;
  clase: string;
  accion: (row: any) => void;
  mostrar?: (row: any) => boolean; // opcional, para lógica condicional
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página actual (base 0)
  size: number;
}

export interface TablaSelectConfig {
  nombreCampo: string;
  opciones: { label: string; value: any }[];
  clase: string;
  action: (item: any, newValue?: any) => void;
  disabled?: boolean;
}

export interface ColumnaSelectConfig {
  columna: string; // nombre de la columna donde va el select
  opciones: { label: string; value: any }[];
  clase?: string;
  nombreCampo: string; // campo del objeto a modificar
  action: (row: any, newValue?: any) => void;
  disabled?: boolean;
}


export interface ExpandedRowConfig {
  infoFields: {
    label: string;
    property: string;
    isNested?: string;
    showWhen?: (item: any) => boolean;
  }[];
  actionButtons: {
    text: string;
    class: string;
    action: (parent: any, item?: any) => void;
    mostrar?: (parentRow: any) => boolean;
  }[];
  selectConfig?: {
    property: string;
    options: { value: any; label: string }[];
    action: (item: any) => void;
  };
  selects?: {
    property: string;
    options: { value: any; label: string }[];
    action: (item: any, value: any) => void;
    class?: string;
    label?: string;
    disabled?: boolean;
  }[];
  subHeaders?: string[];
  subColumnas?: string[];

  /** para subtablas */
  subTableConfig?: {
    columns: Array<
      string | {
        key: string;       // propiedad del objeto
        label: string;     // texto a mostrar en el header
      }
    >;
    dataProperty: string;
    buttons?: {
      text: string;
      class: string;
      action: (parentRow: any, childRow: any) => void;
      mostrar?: (parentRow: any, childRow: any) => boolean;
    }[];
    selects?: {
      property: string;
      options: { value: any; label: string }[];
      action: (parentRow: any, childRow: any, value: any) => void;
      class?: string;
      label?: string;
    }[];
    expandableConfig?: {
      // Configuración para filas expandibles en la subtabla
      infoFields?: {
        label: string;
        property: string;
        isNested?: boolean;
        showWhen?: (parentRow: any, childRow: any) => boolean;
      }[];
      actionButtons?: {
        text: string;
        class: string;
        action: (parentRow: any, childRow: any) => void;
        mostrar?: (parentRow: any, childRow: any) => boolean;
      }[];
      selects?: {
        property: string;
        options: { value: any; label: string }[];
        action: (parentRow: any, childRow: any, value: any) => void;
        class?: string;
        label?: string;
      }[];
    };
  };
}



@Component({
  selector: 'app-table',
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() pageData?: Page<any>;
  @Input() headers: string[] = [];
  @Input() columnas: string[] = [];
  @Input() botones: TablaBotonConfig[] = [];
  @Input() columnaBotones: ColumnaBotonConfig[] = [];
  @Input() columnaSelects: ColumnaSelectConfig[] = [];
  @Input() selects: TablaSelectConfig[] = [];
  @Input() idField: string = 'id'; // Por defecto muestra el campo id
  @Input() expandableConfig?: ExpandedRowConfig;
  @Input() cargando: boolean = false;
  @Input() mensajeVacio: string = 'No hay datos disponibles';
  selectedIndex: number | null = null;
  expandedSubTableRows: {[parentIndex: number]: number | null} = {};
  @Output() paginaCambiada = new EventEmitter<number>()
  @Output() selectedIndexChange = new EventEmitter<number>();
  @Output() rowExpanded = new EventEmitter<{ index: number, item: any }>();


  constructor(private viewportScroller: ViewportScroller) { }

  // Función para expandir/contraer filas
  toggleExpand(index: number): void {
    // Verificar que el índice es válido
    const data = this.pageData?.content || this.data;
    if (index < 0 || index >= data.length) {
      console.error('Índice fuera de rango');
      return;
    }

    const item = data[index];
    if (!item) {
      console.error('Elemento no encontrado en el índice', index);
      return;
    }

    this.selectedIndex = this.selectedIndex === index ? null : index;
    this.selectedIndexChange.emit(this.selectedIndex);

    // Emitir el evento con el item cuando se expande (no cuando se contrae)
    if (this.selectedIndex === index) {
      this.rowExpanded.emit({ index, item });
    }
  }

  getFilas(): any[] {
    return this.pageData ? this.pageData.content : this.data;
  }

  cambiarPagina(nuevaPagina: number): void {
    if (this.pageData && nuevaPagina >= 0 && nuevaPagina < this.pageData.totalPages) {
      this.paginaCambiada.emit(nuevaPagina);
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    try {
      this.viewportScroller.scrollToPosition([0, 0]);
    } catch (error) {
      console.warn('Error al hacer scroll:', error);
    }
  }

  // Función para manejar cambios en selects
  onSelectChange(row: any, selectConfig: TablaSelectConfig, event: Event): void {

    const target = event.target as HTMLSelectElement;
    const newValue = parseInt(target.value.split(':')[1]);

    if (isNaN(newValue)) {
      return;
    }
    
    // Actualizar el valor en el objeto
    row[selectConfig.nombreCampo] = newValue;

    console.log(`Valor actualizado en ${selectConfig.nombreCampo}:`, newValue);

    // Pasar el objeto completo (row) en lugar del valor
    selectConfig.action(row, newValue);
  }

  // Función para manejar cambios en selects de la fila expandida
  onExpandedSelectChange(row: any, event: Event, selectConfig?: any): void {
  const target = event.target as HTMLSelectElement;
  // Extraer solo el número después de los dos puntos
  const newValue = parseInt(target.value.split(':')[1]);

  if (selectConfig) {
    row[selectConfig.property] = newValue;
    selectConfig.action(row, newValue);
  } else if (this.expandableConfig?.selectConfig) {
    row[this.expandableConfig.selectConfig.property] = newValue;
    this.expandableConfig.selectConfig.action(row);
  }
}

  getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  // Obtener columnas filtradas para evitar duplicar el ID
  getColumnasFiltradas(): string[] {
    if (this.expandableConfig && this.columnas.includes('id')) {
      return this.columnas.filter(col => col !== 'id');
    }
    return this.columnas;
  }

  getColumnLabel(column: string | { key: string, label: string }): string {
    return typeof column === 'string' ? column : column.label;
  }

  getColumnKey(column: string | { key: string, label: string }): string {
    return typeof column === 'string' ? column : column.key;
  }

  getBotonesPorColumna(col: string, row: any): TablaBotonConfig[] {
    // Devuelve los botones que deben mostrarse en esta columna
    return (this.botones || []).filter(b => b.columna === col);
  }

  getColumnaBotones(col: string, row: any): ColumnaBotonConfig[] {
    return (this.columnaBotones || []).filter(
      b => b.columna === col && (!b.mostrar || b.mostrar(row))
    );
  }

  getColumnaSelect(col: string, row: any): ColumnaSelectConfig | undefined {
    return this.columnaSelects?.find(s => s.columna === col);
  }

  onColumnaSelectChange(row: any, selectConfig: ColumnaSelectConfig, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedIndex = target.selectedIndex;
    
    // Obtener el valor directamente del array de opciones usando el índice seleccionado
    const newValue = selectConfig.opciones[selectedIndex]?.value;
    
    row[selectConfig.nombreCampo] = newValue;
    selectConfig.action(row, newValue);
  }

  toggleSubTableExpand(parentIndex: number, childIndex: number): void {
    if (this.expandedSubTableRows[parentIndex] === childIndex) {
      this.expandedSubTableRows[parentIndex] = null;
    } else {
      this.expandedSubTableRows[parentIndex] = childIndex;
    }
  }

  isSubTableRowExpanded(parentIndex: number, childIndex: number): boolean {
    return this.expandedSubTableRows[parentIndex] === childIndex;
  }


}