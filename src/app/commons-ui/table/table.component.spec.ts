import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería emitir `rowExpanded` cuando se expande una fila válida', () => {
  const row = { id: 1, nombre: 'Item 1' };
  component.data = [row];

  spyOn(component.rowExpanded, 'emit');
  spyOn(component.selectedIndexChange, 'emit');

  component.toggleExpand(0);

  expect(component.selectedIndex).toBe(0);
  expect(component.selectedIndexChange.emit).toHaveBeenCalledWith(0);
  expect(component.rowExpanded.emit).toHaveBeenCalledWith({ index: 0, item: row });
});

it('debería retornar el contenido de `pageData` si está presente', () => {
  const page = { content: [{ id: 1 }], totalElements: 1, totalPages: 1, number: 0, size: 10 };
  component.pageData = page;

  expect(component.getFilas()).toEqual(page.content);
});

it('debería retornar `data` si `pageData` no está presente', () => {
  const data = [{ id: 2 }];
  component.data = data;

  expect(component.getFilas()).toEqual(data);
});

it('debería emitir evento al cambiar de página válida', () => {
  const pageData = { content: [], totalElements: 0, totalPages: 3, number: 0, size: 10 };
  component.pageData = pageData;

  spyOn(component.paginaCambiada, 'emit');
  const scrollSpy = spyOn<any>(component, 'scrollToTop');

  component.cambiarPagina(2);

  expect(component.paginaCambiada.emit).toHaveBeenCalledWith(2);
  expect(scrollSpy).toHaveBeenCalled();
});


it('debería ejecutar acción del select al cambiar valor', () => {
  const row = { estado: 1 };
  const accionSpy = jasmine.createSpy('accion');
  const selectConfig = {
    nombreCampo: 'estado',
    opciones: [{ label: 'Activo', value: 1 }],
    clase: '',
    action: accionSpy
  };

  const event = { target: { value: '2' } } as unknown as Event;

  component.onSelectChange(row, selectConfig, event);

  expect(row.estado).toBe(2);
  expect(accionSpy).toHaveBeenCalledWith(row, 2); 
});




});
