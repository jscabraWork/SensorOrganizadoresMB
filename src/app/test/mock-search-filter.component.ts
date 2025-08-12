import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Filter } from '../commons-ui/search-filter/search-filter.component';

@Component({
  selector: 'app-search-filter',
  template: '' // Sin template porque es un mock
})
export class MockSearchFilterComponent {
  @Input() filters: Filter[] = [];
  @Output() onBuscar = new EventEmitter<{ [key: string]: string }>();

  // Simula la lógica de buscar como el componente real
  buscar() {
    const filtersObject: { [key: string]: string } = {};
    this.filters.forEach(filter => {
      if (filter.value.trim()) {
        filtersObject[filter.key] = filter.value.trim();
      }
    });
    this.onBuscar.emit(filtersObject);
  }

}
