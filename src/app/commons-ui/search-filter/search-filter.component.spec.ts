import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Filter, SearchFilterComponent } from './search-filter.component';
import { By } from '@angular/platform-browser';

describe('SearchFilterComponent', () => {
  let component: SearchFilterComponent;
  let fixture: ComponentFixture<SearchFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar con filtros vacíos por defecto', () => {
    expect(component.filters).toEqual([]);
  });

  it('debería renderizar los filtros cuando se proporcionan', () => {
    const filtrosPrueba: Filter[] = [
      { key: 'nombre', value: '', placeholder: 'Buscar por nombre', label: 'Nombre' },
      { key: 'email', value: '', placeholder: 'Buscar por email', label: 'Email' }
    ];
    
    component.filters = filtrosPrueba;
    fixture.detectChanges();
    
    const inputs = fixture.debugElement.queryAll(By.css('input'));
    expect(inputs.length).toBe(2);
    
    inputs.forEach((input, index) => {
      expect(input.nativeElement.placeholder).toBe(filtrosPrueba[index].placeholder);
    });
  });

  it('debería emitir el evento de búsqueda con los filtros correctos al llamar a buscar()', () => {
    const filtrosPrueba: Filter[] = [
      { key: 'nombre', value: 'valor prueba', placeholder: 'Buscar por nombre' },
      { key: 'email', value: '', placeholder: 'Buscar por email' }
    ];
    
    component.filters = filtrosPrueba;
    const emitSpy = spyOn(component.onBuscar, 'emit');
    
    component.buscar();
    
    expect(emitSpy).toHaveBeenCalledWith({ nombre: 'valor prueba' });
  });

  it('no debería emitir valores vacíos en los filtros', () => {
    const filtrosPrueba: Filter[] = [
      { key: 'nombre', value: '  ', placeholder: 'Buscar por nombre' },
      { key: 'email', value: '', placeholder: 'Buscar por email' }
    ];
    
    component.filters = filtrosPrueba;
    const emitSpy = spyOn(component.onBuscar, 'emit');
    
    component.buscar();
    
    expect(emitSpy).toHaveBeenCalledWith({});
  });

  it('debería trimear los valores de los filtros antes de emitirlos', () => {
    const filtrosPrueba: Filter[] = [
      { key: 'nombre', value: '  valor con espacios  ', placeholder: 'Buscar por nombre' }
    ];
    
    component.filters = filtrosPrueba;
    const emitSpy = spyOn(component.onBuscar, 'emit');
    
    component.buscar();
    
    expect(emitSpy).toHaveBeenCalledWith({ nombre: 'valor con espacios' });
  });

  it('debería manejar correctamente múltiples filtros con valores', () => {
    const filtrosPrueba: Filter[] = [
      { key: 'nombre', value: 'Juan', placeholder: 'Buscar por nombre' },
      { key: 'apellido', value: 'Pérez', placeholder: 'Buscar por apellido' },
      { key: 'email', value: 'juan@example.com', placeholder: 'Buscar por email' }
    ];
    
    component.filters = filtrosPrueba;
    const emitSpy = spyOn(component.onBuscar, 'emit');
    
    component.buscar();
    
    expect(emitSpy).toHaveBeenCalledWith({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com'
    });
  });

  it('debería mostrar las etiquetas de los filtros cuando están definidas', () => {
    const filtrosPrueba: Filter[] = [
      { key: 'nombre', value: '', label: 'Nombre completo', placeholder: 'Buscar por nombre' }
    ];
    
    component.filters = filtrosPrueba;
    fixture.detectChanges();
    
    const label = fixture.debugElement.query(By.css('label'));
    expect(label.nativeElement.textContent).toContain('Nombre completo');
  });

  it('debería llamar a onEnter del filtro cuando se presiona Enter', () => {
    const mockOnEnter = jasmine.createSpy('onEnter');
    const filtrosPrueba: Filter[] = [
      { key: 'nombre', value: 'test', placeholder: 'Buscar', onEnter: mockOnEnter }
    ];
    
    component.filters = filtrosPrueba;
    fixture.detectChanges();
    
    const input = fixture.debugElement.query(By.css('input'));
    input.triggerEventHandler('keyup.enter', {});
    
    expect(mockOnEnter).toHaveBeenCalledWith('test');
  });
});