import { EditorImagenComponent } from './editor-imagen.component';
import { Imagen, Recurso, EstiloContenido } from '../../../../../models/pagina.model';

/**
 * Tests unitarios optimizados para EditorImagenComponent
 * 
 * ENFOQUE:
 * - Solo lógica específica del componente
 * - Sin dependencias de template/DOM
 * - Tests directos y eficientes
 * - Instanciación directa para evitar dependencias
 */
describe('EditorImagenComponent', () => {
  let component: EditorImagenComponent;

  const mockRecurso: Recurso = {
    id: 1,
    nombre: 'test.jpg',
    url: 'https://example.com/image.jpg',
    tipo: 0,
    formato: 'jpg',
    size: 2048000
  } as Recurso;

  beforeEach(() => {
    // Instanciación directa para evitar dependencias de servicios
    component = new EditorImagenComponent();
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with correct defaults', () => {
      expect(component.imagen).toBeInstanceOf(Imagen);
      expect(component.imagen.objectFit).toBe('contain');
      expect(component.tipos).toEqual([0]);
      expect(component.objectFitOptions).toHaveSize(5);
    });
  });

  describe('seleccionarRecurso', () => {
    it('should assign resource correctly', () => {
      component.seleccionarRecurso(mockRecurso);
      
      expect(component.imagen.recurso).toBe(mockRecurso);
    });

    it('should replace previous resource', () => {
      const first = { ...mockRecurso, nombre: 'first.jpg' };
      const second = { ...mockRecurso, nombre: 'second.jpg' };
      
      component.seleccionarRecurso(first);
      component.seleccionarRecurso(second);
      
      expect(component.imagen.recurso.nombre).toBe('second.jpg');
    });
  });

  describe('formatearTamano', () => {
    it('should format file sizes correctly', () => {
      expect(component.formatearTamano(0)).toBe('0 B');
      expect(component.formatearTamano(1024)).toBe('1.00 KB');
      expect(component.formatearTamano(1048576)).toBe('1.00 MB');
    });

    it('should handle null/undefined', () => {
      expect(component.formatearTamano(null as any)).toBe('0 B');
      expect(component.formatearTamano(undefined as any)).toBe('0 B');
    });
  });

  describe('esUrlValida', () => {
    it('should accept valid URLs and empty values', () => {
      expect(component.esUrlValida('https://example.com')).toBe(true);
      expect(component.esUrlValida('')).toBe(true);
      expect(component.esUrlValida(null as any)).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(component.esUrlValida('not-a-url')).toBe(false);
      expect(component.esUrlValida('www.example.com')).toBe(false);
    });
  });

  describe('obtenerElementoActual', () => {
    it('should return current imagen instance', () => {
      expect(component.obtenerElementoActual()).toBe(component.imagen);
    });
  });

  describe('guardar', () => {
    beforeEach(() => {
      spyOn(component.contenidoCreado, 'emit');
      spyOn(window, 'alert');
    });

    it('should save with valid resource', () => {
      component.imagen.recurso = mockRecurso;
      
      component.guardar();
      
      expect(component.contenidoCreado.emit).toHaveBeenCalledWith(jasmine.any(Imagen));
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should not save without resource', () => {
      component.imagen.recurso = null as any;
      
      component.guardar();
      
      expect(component.contenidoCreado.emit).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Debe seleccionar una imagen');
    });

    it('should validate target URL', () => {
      component.imagen.recurso = mockRecurso;
      component.imagen.target = 'invalid-url';
      
      component.guardar();
      
      expect(component.contenidoCreado.emit).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Por favor, ingrese una URL válida para el enlace');
    });

    it('should create new instance when saving', () => {
      component.imagen.recurso = mockRecurso;
      component.imagen.objectFit = 'cover';
      
      component.guardar();
      
      const emitted = (component.contenidoCreado.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emitted).not.toBe(component.imagen);
      expect(emitted.objectFit).toBe('cover');
    });
  });
});