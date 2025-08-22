import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginacionConfig {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
}

export interface PaginacionEvent {
  page: number;
  size: number;
}

@Component({
  selector: 'app-paginacion',
  imports: [CommonModule],
  templateUrl: './paginacion.component.html',
  styleUrl: './paginacion.component.scss'
})
export class PaginacionComponent {
  @Input() config: PaginacionConfig = {
    currentPage: 0,
    totalPages: 0,
    pageSize: 10,
    totalElements: 0
  };

  @Input() showPageSizeSelector: boolean = true;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50, 100];

  @Output() pageChange = new EventEmitter<PaginacionEvent>();

  onPageChange(page: number): void {
    if (page >= 0 && page < this.config.totalPages && page !== this.config.currentPage) {
      this.pageChange.emit({
        page: page,
        size: this.config.pageSize
      });
    }
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value);
    this.pageChange.emit({
      page: 0, // Reset to first page when changing size
      size: newSize
    });
  }

  getVisiblePages(): number[] {
    const maxVisible = 5;
    const current = this.config.currentPage;
    const total = this.config.totalPages;
    
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i);
    }
    
    let start = Math.max(0, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible);
    
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  getStartIndex(): number {
    return this.config.currentPage * this.config.pageSize + 1;
  }

  getEndIndex(): number {
    const endIndex = (this.config.currentPage + 1) * this.config.pageSize;
    return Math.min(endIndex, this.config.totalElements);
  }
}