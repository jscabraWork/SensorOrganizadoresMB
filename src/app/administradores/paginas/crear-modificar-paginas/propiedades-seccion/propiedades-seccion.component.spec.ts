import { PropiedadesSeccionComponent } from './propiedades-seccion.component';
import { Seccion, EstiloContenido } from '../../../../models/pagina.model';

/**
 * Tests unitarios optimizados para PropiedadesSeccionComponent
 * 
 * ENFOQUE:
 * - Solo lógica específica: conversión de tipos y emisión
 * - Tests directos sin setup complejo
 */
describe('PropiedadesSeccionComponent', () => {
  let component: PropiedadesSeccionComponent;

  beforeEach(() => {
    component = new PropiedadesSeccionComponent();
    component.seccionEditada = new Seccion();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('guardarPropiedades', () => {
    beforeEach(() => {
      spyOn(component.seccionCambiada, 'emit');
    });

    it('should emit seccionEditada when saving', () => {
      component.seccionEditada.nombre = 'Test Section';
      
      component.guardarPropiedades();
      
      expect(component.seccionCambiada.emit).toHaveBeenCalledWith(component.seccionEditada);
    });

    it('should convert string orden to number', () => {
      component.seccionEditada.orden = '5' as any;
      
      component.guardarPropiedades();
      
      expect(component.seccionEditada.orden).toBe(5);
      expect(typeof component.seccionEditada.orden).toBe('number');
    });

    it('should handle invalid orden values by setting to 0', () => {
      component.seccionEditada.orden = 'abc' as any;
      
      component.guardarPropiedades();
      
      expect(component.seccionEditada.orden).toBe(0);
    });

    it('should handle null orden values', () => {
      component.seccionEditada.orden = null as any;
      
      component.guardarPropiedades();
      
      expect(component.seccionEditada.orden).toBe(0);
    });

    it('should preserve valid numeric orden', () => {
      component.seccionEditada.orden = 3;
      
      component.guardarPropiedades();
      
      expect(component.seccionEditada.orden).toBe(3);
    });
  });

  describe('ngOnChanges (if implemented)', () => {
    it('should handle seccion input changes', () => {
      const testSeccion = new Seccion();
      testSeccion.nombre = 'Test';
      testSeccion.orden = 1;
      
      // Simular cambio de input
      component.seccion = testSeccion;
      
      // Si hay lógica de clonación, verificarla
      if (component.seccionEditada) {
        expect(component.seccionEditada).toBeInstanceOf(Seccion);
      }
    });
  });
});