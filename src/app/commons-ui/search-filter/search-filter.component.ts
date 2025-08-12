import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Filter {
  key: string;
  value: string;
  placeholder?: string;
  label?: string;
  onEnter?: (value: string) => void
}

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.scss'
})
export class SearchFilterComponent {
  @Input() filters: Filter[] = []
  @Output() onBuscar = new EventEmitter<{[key: string]: string}>();

  buscar() {
    const filtersObject: {[key: string]: string} = {};
    this.filters.forEach(filter => {
      if (filter.value.trim()) {
        filtersObject[filter.key] = filter.value.trim();
      }
    });
    this.onBuscar.emit(filtersObject);
  }
}