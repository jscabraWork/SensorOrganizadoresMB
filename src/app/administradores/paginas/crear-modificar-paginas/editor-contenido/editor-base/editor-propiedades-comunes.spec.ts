import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SimpleChange } from '@angular/core';
import { Contenido, EstiloContenido } from '../../../../../models/pagina.model';
import { EditorPropiedadesComunesComponent } from './editor-propiedades-comunes';

/**
 * Tests unitarios para EditorPropiedadesComunesComponent
 * 
 * PRINCIPIOS:
 * - Solo testear lógica propia del componente
 * - Verificar manejo de dimensiones y estilos
 * - Probar parseo de valores CSS
 * - Validar actualización de propiedades
 */
describe('EditorPropiedadesComunesComponent', () => {
  let component: EditorPropiedadesComunesComponent;
  let fixture: ComponentFixture<EditorPropiedadesComunesComponent>;
  let mockContenido: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorPropiedadesComunesComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(EditorPropiedadesComunesComponent);
    component = fixture.componentInstance;

    // Mock contenido con estilos
    mockContenido = {
      estilos: {
        width: '100px',
        height: 'auto',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 5,
        marginRight: 5,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 4,
        borderColor: '#000000'
      }
    };

    component.contenido = mockContenido;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Tests de inicialización
  describe('Initialization', () => {
    it('should initialize with correct dimensions from content', () => {
      // El componente parsea desde mockContenido.estilos en fixture.detectChanges()
      expect(component.dimensiones.width).toEqual({ valor: 100, unidad: 'px' });
      expect(component.dimensiones.height).toEqual({ valor: 0, unidad: 'auto' });
      expect(component.marginVerticalAuto).toBe(false);
      expect(component.marginHorizontalAuto).toBe(false);
    });

    it('should initialize dimensions from content styles on ngOnInit', () => {
      component.ngOnInit();
      
      expect(component.dimensiones.width).toEqual({ valor: 100, unidad: 'px' });
      expect(component.dimensiones.height).toEqual({ valor: 0, unidad: 'auto' });
    });

    it('should handle ngOnChanges when content changes', () => {
      spyOn(component, 'inicializarDimensiones');
      const changes = {
        contenido: new SimpleChange(null, mockContenido, false)
      };
      
      component.ngOnChanges(changes);
      
      expect(component.inicializarDimensiones).toHaveBeenCalled();
    });
  });

  // Tests de parseo de dimensiones
  describe('Dimension Parsing', () => {
    it('should parse pixel values correctly', () => {
      mockContenido.estilos.width = '250px';
      
      component.parsearDimensionDesdeEstilo('width');
      
      expect(component.dimensiones.width).toEqual({ valor: 250, unidad: 'px' });
    });

    it('should parse percentage values correctly', () => {
      mockContenido.estilos.width = '75%';
      
      component.parsearDimensionDesdeEstilo('width');
      
      expect(component.dimensiones.width).toEqual({ valor: 75, unidad: '%' });
    });

    it('should handle auto values', () => {
      mockContenido.estilos.height = 'auto';
      
      component.parsearDimensionDesdeEstilo('height');
      
      expect(component.dimensiones.height).toEqual({ valor: 0, unidad: 'auto' });
    });

    it('should parse different units correctly', () => {
      const testCases = [
        { input: '2em', expected: { valor: 2, unidad: 'em' } },
        { input: '16rem', expected: { valor: 16, unidad: 'rem' } },
        { input: '50vh', expected: { valor: 50, unidad: 'vh' } },
        { input: '100vw', expected: { valor: 100, unidad: 'vw' } }
      ];

      testCases.forEach(test => {
        mockContenido.estilos.width = test.input;
        component.parsearDimensionDesdeEstilo('width');
        expect(component.dimensiones.width).toEqual(test.expected);
      });
    });

    it('should handle invalid values gracefully', () => {
      const originalWidth = { ...component.dimensiones.width };
      mockContenido.estilos.width = 'invalid-value';
      
      component.parsearDimensionDesdeEstilo('width');
      
      expect(component.dimensiones.width).toEqual(originalWidth);
    });
  });

  // Tests de actualización de dimensiones
  describe('Dimension Updates', () => {
    it('should update dimension value', () => {
      component.actualizarValorDimension('width', 200);
      
      expect(component.dimensiones.width.valor).toBe(200);
      // La unidad se mantiene como 'px' que ya estaba parseada
      expect(mockContenido.estilos.width).toBe('200px');
    });

    it('should update dimension unit', () => {
      component.actualizarUnidadDimension('width', '%');
      
      expect(component.dimensiones.width.unidad).toBe('%');
      expect(mockContenido.estilos.width).toBe('100%');
    });

    it('should handle auto unit correctly', () => {
      component.actualizarUnidadDimension('height', 'auto');
      
      expect(component.dimensiones.height.unidad).toBe('auto');
      expect(mockContenido.estilos.height).toBe('auto');
    });

    it('should not update when content is null', () => {
      component.contenido = null;
      
      component.actualizarValorDimension('width', 300);
      
      expect(mockContenido.estilos.width).toBe('100px'); // Unchanged
    });
  });

  // Tests de actualización de propiedades generales
  describe('Property Updates', () => {
    it('should update simple properties', () => {
      component.actualizarPropiedad('estilos.backgroundColor', '#ff0000');
      
      expect(mockContenido.estilos.backgroundColor).toBe('#ff0000');
    });

    it('should update nested properties', () => {
      component.actualizarPropiedad('estilos.marginTop', 20);
      
      expect(mockContenido.estilos.marginTop).toBe(20);
    });

    it('should handle deep nested paths', () => {
      mockContenido.nested = { deep: { property: 'initial' } };
      
      component.actualizarPropiedad('nested.deep.property', 'updated');
      
      expect(mockContenido.nested.deep.property).toBe('updated');
    });

    it('should handle invalid paths gracefully', () => {
      expect(() => {
        component.actualizarPropiedad('invalid.path.property', 'value');
      }).not.toThrow();
    });

    it('should not update when content is null', () => {
      component.contenido = null;
      const originalValue = mockContenido.estilos.backgroundColor;
      
      component.actualizarPropiedad('estilos.backgroundColor', '#ff0000');
      
      expect(mockContenido.estilos.backgroundColor).toBe(originalValue);
    });
  });

  // Tests de márgenes automáticos
  describe('Auto Margins', () => {
    it('should toggle vertical margins to auto', () => {
      component.toggleMarginVerticalAuto();
      
      expect(component.marginVerticalAuto).toBe(true);
      expect(mockContenido.estilos.marginTop).toBeNull();
      expect(mockContenido.estilos.marginBottom).toBeNull();
    });

    it('should toggle vertical margins back to manual', () => {
      component.marginVerticalAuto = true;
      
      component.toggleMarginVerticalAuto();
      
      expect(component.marginVerticalAuto).toBe(false);
      expect(mockContenido.estilos.marginTop).toBe(0);
      expect(mockContenido.estilos.marginBottom).toBe(0);
    });

    it('should toggle horizontal margins to auto', () => {
      component.toggleMarginHorizontalAuto();
      
      expect(component.marginHorizontalAuto).toBe(true);
      expect(mockContenido.estilos.marginLeft).toBeNull();
      expect(mockContenido.estilos.marginRight).toBeNull();
    });

    it('should toggle horizontal margins back to manual', () => {
      component.marginHorizontalAuto = true;
      
      component.toggleMarginHorizontalAuto();
      
      expect(component.marginHorizontalAuto).toBe(false);
      expect(mockContenido.estilos.marginLeft).toBe(0);
      expect(mockContenido.estilos.marginRight).toBe(0);
    });

    it('should handle margin toggles when content is null', () => {
      component.contenido = null;
      
      expect(() => {
        component.toggleMarginVerticalAuto();
        component.toggleMarginHorizontalAuto();
      }).not.toThrow();
    });
  });

  // Tests de propiedades del componente
  describe('Component Properties', () => {
    it('should have readonly unidades property', () => {
      expect(component.unidades).toBeDefined();
      expect(Array.isArray(component.unidades)).toBe(true);
    });

    it('should maintain data integrity during operations', () => {
      const originalContent = JSON.parse(JSON.stringify(mockContenido));
      
      component.actualizarValorDimension('width', 150);
      component.actualizarPropiedad('estilos.backgroundColor', '#00ff00');
      
      // Verificar cambios específicos
      expect(mockContenido.estilos.width).toBe('150px'); // Mantiene unidad 'px'
      expect(mockContenido.estilos.backgroundColor).toBe('#00ff00');
      
      // Otras propiedades deben permanecer sin cambios
      expect(mockContenido.estilos.marginTop).toBe(originalContent.estilos.marginTop);
      expect(mockContenido.estilos.borderWidth).toBe(originalContent.estilos.borderWidth);
    });
  });
});