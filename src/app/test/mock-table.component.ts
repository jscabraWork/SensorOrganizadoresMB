import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Page } from '../models/page.mode';
import { ExpandedRowConfig, TablaBotonConfig, TablaSelectConfig } from '../commons-ui/table/table.component';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-table',
  template: '<div></div>' ,
  providers: [CurrencyPipe, DatePipe],
})
export class MockTableComponent {
  @Input() data: any[] = [];
  @Input() pageData?: Page<any>;
  @Input() headers: string[] = [];
  @Input() columnas: string[] = [];
  @Input() botones: TablaBotonConfig[] = [];
  @Input() selects: TablaSelectConfig[] = [];
  @Input() idField: string = 'id';
  @Input() expandableConfig?: ExpandedRowConfig;
  @Input() cargando: boolean = false;
  @Input() mensajeVacio: string = 'No hay datos disponibles';

  @Output() paginaCambiada = new EventEmitter<number>();
  @Output() selectedIndexChange = new EventEmitter<number>();
  @Output() rowExpanded = new EventEmitter<{ index: number, item: any }>();
}
