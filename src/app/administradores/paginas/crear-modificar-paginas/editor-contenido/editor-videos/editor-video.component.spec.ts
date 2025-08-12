import { EditorVideoComponent } from './editor-video.component';
import { Video, Recurso, EstiloContenido } from '../../../../../models/pagina.model';

/**
 * Tests unitarios optimizados para EditorVideoComponent
 * 
 * ENFOQUE:
 * - Solo lógica específica del componente
 * - Validación de tipos de recurso (video vs imagen)
 * - Propiedades de reproducción específicas de video
 * - Instanciación directa para evitar dependencias
 */
describe('EditorVideoComponent', () => {
  let component: EditorVideoComponent;

  const mockVideoRecurso: Recurso = {
    id: 1,
    nombre: 'test-video.mp4',
    url: 'https://example.com/video.mp4',
    tipo: 1, // Tipo video
    formato: 'mp4',
    size: 5242880
  } as Recurso;

  const mockImageRecurso: Recurso = {
    id: 2,
    nombre: 'test-image.jpg',
    url: 'https://example.com/image.jpg',
    tipo: 0, // Tipo imagen
    formato: 'jpg',
    size: 1024000
  } as Recurso;

  beforeEach(() => {
    // Instanciación directa para evitar dependencias de servicios
    component = new EditorVideoComponent();
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with correct defaults for video', () => {
      expect(component.video).toBeInstanceOf(Video);
      expect(component.tipos).toEqual([1]); // Solo videos
      expect(component.video.autoplay).toBeFalsy();
      expect(component.video.bucle).toBeFalsy();
      expect(component.video.controls).toBeTruthy();
      expect(component.video.muted).toBeFalsy();
    });
  });

  describe('inicializarDesdeContenidoExistente', () => {
    it('should initialize from existing video content', () => {
      const mockContenido = new Video();
      mockContenido.recurso = mockVideoRecurso;
      mockContenido.autoplay = true;
      mockContenido.bucle = true;
      mockContenido.controls = false;
      mockContenido.muted = true;
      
      component.contenidoExistente = mockContenido;
      component.inicializarDesdeContenidoExistente();

      expect(component.video.recurso?.nombre).toBe('test-video.mp4');
      expect(component.video.autoplay).toBe(true);
      expect(component.video.bucle).toBe(true);
      expect(component.video.controls).toBe(false);
      expect(component.video.muted).toBe(true);
    });

    it('should create estilos if not exists', () => {
      const mockContenido = { estilos: undefined } as any;
      component.contenidoExistente = mockContenido;
      
      component.inicializarDesdeContenidoExistente();

      expect(component.video.estilos).toBeInstanceOf(EstiloContenido);
    });

    it('should set default playback properties for undefined values', () => {
      const mockContenido = {
        autoplay: undefined,
        bucle: undefined,
        controls: undefined,
        muted: undefined
      } as any;
      
      component.contenidoExistente = mockContenido;
      component.inicializarDesdeContenidoExistente();

      expect(component.video.autoplay).toBe(false);
      expect(component.video.bucle).toBe(false);
      expect(component.video.controls).toBe(true);
      expect(component.video.muted).toBe(false);
    });
  });

  describe('seleccionarRecurso - Video Type Validation', () => {
    beforeEach(() => {
      spyOn(window, 'alert');
    });

    it('should accept video resources', () => {
      component.seleccionarRecurso(mockVideoRecurso);
      
      expect(component.video.recurso).toBe(mockVideoRecurso);
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should reject non-video resources', () => {
      component.seleccionarRecurso(mockImageRecurso);
      
      expect(component.video.recurso).toBeUndefined();
      expect(window.alert).toHaveBeenCalledWith('El recurso seleccionado no es un video');
    });

    it('should replace previous video resource', () => {
      const firstVideo = { ...mockVideoRecurso, nombre: 'first.mp4' };
      const secondVideo = { ...mockVideoRecurso, nombre: 'second.mp4' };
      
      component.seleccionarRecurso(firstVideo);
      component.seleccionarRecurso(secondVideo);
      
      expect(component.video.recurso.nombre).toBe('second.mp4');
    });
  });

  describe('formatearTamano', () => {
    it('should format video file sizes correctly', () => {
      expect(component.formatearTamano(0)).toBe('0 B');
      expect(component.formatearTamano(1024)).toBe('1.00 KB');
      expect(component.formatearTamano(5242880)).toBe('5.00 MB'); // Tamaño del mock video
    });

    it('should handle null/undefined', () => {
      expect(component.formatearTamano(null as any)).toBe('0 B');
      expect(component.formatearTamano(undefined as any)).toBe('0 B');
    });
  });

  describe('obtenerElementoActual', () => {
    it('should return current video instance', () => {
      expect(component.obtenerElementoActual()).toBe(component.video);
    });
  });

  describe('guardar', () => {
    beforeEach(() => {
      spyOn(component.contenidoCreado, 'emit');
      spyOn(window, 'alert');
    });

    it('should save with valid video resource', () => {
      component.video.recurso = mockVideoRecurso;
      
      component.guardar();
      
      expect(component.contenidoCreado.emit).toHaveBeenCalledWith(jasmine.any(Video));
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should not save without video resource', () => {
      component.video.recurso = null as any;
      
      component.guardar();
      
      expect(component.contenidoCreado.emit).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Debe seleccionar un archivo de video');
    });

    it('should create new instance with all playback properties', () => {
      component.video.recurso = mockVideoRecurso;
      component.video.autoplay = true;
      component.video.bucle = true;
      component.video.controls = false;
      component.video.muted = true;
      
      component.guardar();
      
      const emitted = (component.contenidoCreado.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emitted).not.toBe(component.video);
      expect(emitted.autoplay).toBe(true);
      expect(emitted.bucle).toBe(true);
      expect(emitted.controls).toBe(false);
      expect(emitted.muted).toBe(true);
    });
  });

  // Tests específicos de propiedades de video
  describe('Video Playback Properties', () => {
    it('should handle autoplay configuration', () => {
      component.video.autoplay = true;
      expect(component.video.autoplay).toBe(true);
      
      component.video.autoplay = false;
      expect(component.video.autoplay).toBe(false);
    });

    it('should handle loop (bucle) configuration', () => {
      component.video.bucle = true;
      expect(component.video.bucle).toBe(true);
      
      component.video.bucle = false;
      expect(component.video.bucle).toBe(false);
    });

    it('should handle controls visibility', () => {
      component.video.controls = false;
      expect(component.video.controls).toBe(false);
      
      component.video.controls = true;
      expect(component.video.controls).toBe(true);
    });

    it('should handle muted state', () => {
      component.video.muted = true;
      expect(component.video.muted).toBe(true);
      
      component.video.muted = false;
      expect(component.video.muted).toBe(false);
    });
  });

  // Test de configuraciones típicas de video
  describe('Video Configuration Scenarios', () => {
    beforeEach(() => {
      component.video.recurso = mockVideoRecurso;
    });

    it('should support presentation video configuration', () => {
      // Video de fondo/presentación típico
      component.video.autoplay = true;
      component.video.muted = true;
      component.video.controls = false;
      component.video.bucle = true;
      
      const result = component.obtenerElementoActual();
      expect(result.autoplay).toBe(true);
      expect(result.muted).toBe(true);
      expect(result.controls).toBe(false);
      expect(result.bucle).toBe(true);
    });

    it('should support interactive video configuration', () => {
      // Video interactivo típico
      component.video.autoplay = false;
      component.video.muted = false;
      component.video.controls = true;
      component.video.bucle = false;
      
      const result = component.obtenerElementoActual();
      expect(result.autoplay).toBe(false);
      expect(result.muted).toBe(false);
      expect(result.controls).toBe(true);
      expect(result.bucle).toBe(false);
    });
  });

  // Test de flujo completo específico para video
  describe('Complete Video Workflow', () => {
    it('should handle full video editing workflow', () => {
      spyOn(component.contenidoCreado, 'emit');
      
      // 1. Seleccionar recurso de video
      component.seleccionarRecurso(mockVideoRecurso);
      expect(component.video.recurso).toBe(mockVideoRecurso);
      
      // 2. Configurar propiedades específicas de video
      component.video.autoplay = true;
      component.video.muted = true;
      
      // 3. Guardar
      component.guardar();
      expect(component.contenidoCreado.emit).toHaveBeenCalled();
      
      const saved = (component.contenidoCreado.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(saved.recurso.tipo).toBe(1); // Verificar que es video
      expect(saved.autoplay).toBe(true);
      expect(saved.muted).toBe(true);
    });

    it('should prevent saving with wrong resource type', () => {
      spyOn(window, 'alert');
      spyOn(component.contenidoCreado, 'emit');
      
      // Intentar usar recurso de imagen
      component.seleccionarRecurso(mockImageRecurso);
      component.guardar();
      
      expect(window.alert).toHaveBeenCalledTimes(2); // Selección + Guardado
      expect(component.contenidoCreado.emit).not.toHaveBeenCalled();
    });
  });
});