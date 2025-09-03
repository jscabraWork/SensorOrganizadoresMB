import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  value: any;
  label: string;
}

export interface Filter {
  key: string;
  value: any;
  type?: 'text' | 'date' | 'select' | 'number';
  placeholder?: string;
  label?: string;
  options?: FilterOption[];
  onEnter?: (value: string) => void;
  onChange?: (value: any) => void;
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
    const filtersObject: {[key: string]: any} = {};
    this.filters.forEach(filter => {
      if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
        const value = typeof filter.value === 'string' ? filter.value.trim() : filter.value;
        if (value !== '') {
          filtersObject[filter.key] = value;
        }
      }
    });
    this.onBuscar.emit(filtersObject);
  }

  onFilterChange(filter: Filter) {
    if (filter.onChange) {
      filter.onChange(filter.value);
    }
  }
}