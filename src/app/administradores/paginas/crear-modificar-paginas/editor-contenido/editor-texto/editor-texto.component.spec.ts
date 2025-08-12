import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { EditorTextoComponent } from './editor-texto.component';
import { Texto, EstiloContenido } from '../../../../../models/pagina.model';
import { Component, Input } from '@angular/core';

/**
 * Tests unitarios optimizados para EditorTextoComponent
 * 
 * ENFOQUE:
 * - Solo testear lógica específica del componente
 * - Mock de dependencias externas
 * - Tests simples y directos
 * - Evitar tests redundantes de propiedades básicas
 */

// Mock del componente de propiedades comunes
@Component({
  selector: 'app-editor-propiedades-comunes',
  template: '',
  standalone: true
})
class MockEditorPropiedadesComunesComponent {
  @Input() contenido: any;
}

describe('EditorTextoComponent', () => {
  let component: EditorTextoComponent;
  let fixture: ComponentFixture<EditorTextoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EditorTextoComponent, 
        FormsModule,
        MockEditorPropiedadesComunesComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditorTextoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test básico de inicialización
  describe('Initialization', () => {
    it('should initialize with default Texto instance', () => {
      expect(component.texto).toBeInstanceOf(Texto);
      expect(component.texto.descripcion).toBe('Texto');
      expect(component.texto.fontSize).toBe(16);
      expect(component.texto.estilos).toBeInstanceOf(EstiloContenido);
    });

    it('should have required options arrays', () => {
      expect(Array.isArray(component.fontWeightOptions)).toBe(true);
      expect(Array.isArray(component.fontStyleOptions)).toBe(true);
      expect(Array.isArray(component.textAlignOptions)).toBe(true);
      expect(component.fontWeightOptions.length).toBeGreaterThan(0);
    });
  });

  // Test del método específico del componente
  describe('inicializarDesdeContenidoExistente', () => {
    it('should initialize from existing content', () => {
      const existingTexto = new Texto();
      existingTexto.descripcion = 'Texto existente';
      existingTexto.fontSize = 20;
      existingTexto.color = '#ff0000';
      
      component.contenidoExistente = existingTexto;
      component.inicializarDesdeContenidoExistente();
      
      expect(component.texto.descripcion).toBe('Texto existente');
      expect(component.texto.fontSize).toBe(20);
      expect(component.texto.color).toBe('#ff0000');
    });

    it('should ensure estilos object exists', () => {
      const existingTexto = { descripcion: 'Test' } as any; // Sin estilos
      component.contenidoExistente = existingTexto;
      
      component.inicializarDesdeContenidoExistente();
      
      expect(component.texto.estilos).toBeInstanceOf(EstiloContenido);
    });

    it('should call parent method', () => {
      spyOn(Object.getPrototypeOf(Object.getPrototypeOf(component)), 'inicializarDesdeContenidoExistente');
      
      component.inicializarDesdeContenidoExistente();
      
      expect(Object.getPrototypeOf(Object.getPrototypeOf(component)).inicializarDesdeContenidoExistente).toHaveBeenCalled();
    });
  });

  // Test del método abstracto implementado
  describe('obtenerElementoActual', () => {
    it('should return current texto instance', () => {
      component.texto.descripcion = 'Test texto';
      
      const result = component.obtenerElementoActual();
      
      expect(result).toBe(component.texto);
      expect(result.descripcion).toBe('Test texto');
    });
  });

  // Test del método guardar (lógica específica)
  describe('guardar method', () => {
    it('should emit new Texto instance with copied properties', () => {
      spyOn(component.contenidoCreado, 'emit');
      
      component.texto.descripcion = 'Texto de prueba';
      component.texto.fontSize = 18;
      component.texto.color = '#0000ff';
      
      component.guardar();
      
      expect(component.contenidoCreado.emit).toHaveBeenCalledTimes(1);
      
      const emittedTexto = (component.contenidoCreado.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedTexto).toBeInstanceOf(Texto);
      expect(emittedTexto).not.toBe(component.texto); // Nueva instancia
      expect(emittedTexto.descripcion).toBe('Texto de prueba');
      expect(emittedTexto.fontSize).toBe(18);
      expect(emittedTexto.color).toBe('#0000ff');
    });

    it('should work with empty content', () => {
      spyOn(component.contenidoCreado, 'emit');
      
      component.texto.descripcion = '';
      component.guardar();
      
      expect(component.contenidoCreado.emit).toHaveBeenCalled();
    });
  });

  // Test de configuración de opciones (solo verificar estructura)
  describe('Configuration options structure', () => {
    it('should have properly structured fontWeight options', () => {
      const option = component.fontWeightOptions[0];
      expect(typeof option.value).toBe('string');
      expect(typeof option.label).toBe('string');
    });

    it('should include essential fontWeight values', () => {
      const values = component.fontWeightOptions.map(opt => opt.value);
      expect(values).toContain('normal');
      expect(values).toContain('bold');
    });

    it('should include essential textAlign values', () => {
      const values = component.textAlignOptions.map(opt => opt.value);
      expect(values).toContain('left');
      expect(values).toContain('center');
      expect(values).toContain('right');
    });
  });
});