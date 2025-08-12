import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { SelectorTipoContenidoComponent } from './selector-tipo-contenido.component';

/**
 * Tests unitarios para SelectorTipoContenidoComponent
 * 
 * PRINCIPIOS:
 * - Solo testear lógica propia del componente
 * - Verificar renderizado y eventos de UI
 * - Probar emisión de @Output
 * - Validar estructura de datos
 */
describe('SelectorTipoContenidoComponent', () => {
  let component: SelectorTipoContenidoComponent;
  let fixture: ComponentFixture<SelectorTipoContenidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorTipoContenidoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorTipoContenidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Tests de datos del componente
  describe('Component Data', () => {
    it('should have correct tiposContenido with 4 items', () => {
      expect(component.tiposContenido).toHaveSize(4);
      
      const expectedTypes = [
        { valor: 0, etiqueta: 'Imagen', icono: '' },
        { valor: 1, etiqueta: 'Video', icono: '' },
        { valor: 2, etiqueta: 'Texto', icono: '' },
        { valor: 3, etiqueta: 'Enlace', icono: '' }
      ];
      
      expect(component.tiposContenido).toEqual(expectedTypes);
    });

    it('should have valid structure for each content type', () => {
      component.tiposContenido.forEach((tipo, index) => {
        expect(tipo.valor).toBe(index);
        expect(tipo.etiqueta).toBeTruthy();
        expect(typeof tipo.valor).toBe('number');
        expect(typeof tipo.etiqueta).toBe('string');
        expect(typeof tipo.icono).toBe('string');
      });
    });
  });

  // Tests de renderizado
  describe('Template Rendering', () => {
    it('should render title correctly', () => {
      const titleElement = fixture.debugElement.query(By.css('h3'));
      expect(titleElement.nativeElement.textContent).toBe('Seleccionar Tipo de Contenido');
    });

    it('should render all content types', () => {
      const tipoElements = fixture.debugElement.queryAll(By.css('.tipo-contenido'));
      expect(tipoElements).toHaveSize(4);
    });

    it('should display correct labels for each type', () => {
      const tituloElements = fixture.debugElement.queryAll(By.css('.titulo'));
      const expectedLabels = ['Imagen', 'Video', 'Texto', 'Enlace'];
      
      tituloElements.forEach((element, index) => {
        expect(element.nativeElement.textContent).toBe(expectedLabels[index]);
      });
    });

    it('should have proper CSS classes', () => {
      const containerElement = fixture.debugElement.query(By.css('.selector-tipo-contenido'));
      expect(containerElement).toBeTruthy();

      const gridElement = fixture.debugElement.query(By.css('.tipos-contenido'));
      expect(gridElement).toBeTruthy();

      const tipoElements = fixture.debugElement.queryAll(By.css('.tipo-contenido'));
      expect(tipoElements.length).toBeGreaterThan(0);
    });
  });

  // Tests de eventos y lógica del componente
  describe('User Interactions', () => {
    it('should emit correct value when seleccionarTipo is called', () => {
      spyOn(component.tipoSeleccionado, 'emit');
      
      // Test multiple values
      [0, 1, 2, 3].forEach(valor => {
        component.seleccionarTipo(valor);
        expect(component.tipoSeleccionado.emit).toHaveBeenCalledWith(valor);
      });
      
      expect(component.tipoSeleccionado.emit).toHaveBeenCalledTimes(4);
    });

    it('should emit when clicking on tipo-contenido elements', () => {
      spyOn(component.tipoSeleccionado, 'emit');
      const tipoElements = fixture.debugElement.queryAll(By.css('.tipo-contenido'));
      
      // Click on first element (Imagen - valor: 0)
      tipoElements[0].nativeElement.click();
      expect(component.tipoSeleccionado.emit).toHaveBeenCalledWith(0);
      
      // Click on last element (Enlace - valor: 3)
      tipoElements[3].nativeElement.click();
      expect(component.tipoSeleccionado.emit).toHaveBeenCalledWith(3);
      
      expect(component.tipoSeleccionado.emit).toHaveBeenCalledTimes(2);
    });
  });

  // Tests de estructura y propiedades
  describe('Component Structure', () => {
    it('should have correct HTML structure and content', () => {
      const containerElement = fixture.debugElement.query(By.css('.selector-tipo-contenido'));
      const title = containerElement.query(By.css('h3'));
      const grid = containerElement.query(By.css('.tipos-contenido'));
      const items = grid.queryAll(By.css('.tipo-contenido'));
      
      expect(containerElement).toBeTruthy();
      expect(title.nativeElement.textContent).toBe('Seleccionar Tipo de Contenido');
      expect(grid).toBeTruthy();
      expect(items).toHaveSize(4);
      
      // Verify each item has required elements and correct content
      items.forEach((item, index) => {
        const icono = item.query(By.css('.icono'));
        const titulo = item.query(By.css('.titulo'));
        expect(icono).toBeTruthy();
        expect(titulo).toBeTruthy();
        expect(titulo.nativeElement.textContent).toBe(component.tiposContenido[index].etiqueta);
      });
    });

    it('should initialize with correct default values', () => {
      expect(component.tiposContenido).toBeDefined();
      expect(component.tiposContenido.length).toBe(4);
      expect(component.tipoSeleccionado).toBeDefined();
      
      // Data should not change after interactions
      const originalTypes = [...component.tiposContenido];
      component.seleccionarTipo(0);
      expect(component.tiposContenido).toEqual(originalTypes);
    });
  });
});