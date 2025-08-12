import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { CrearModificarPaginasComponent } from './crear-modificar-paginas.component';
import { PaginasDataService } from '../../../service/data/paginas.data.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Enlace, Imagen, Pagina, Seccion, Texto, Video } from '../../../models/pagina.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

// Mock para app-title
@Component({
  selector: 'app-title',
  template: '',
  standalone: true,
})
class TitleComponentMock {
  @Input() title: string;
  @Input() showBackButton: boolean;
  @Output() onBack = new EventEmitter<void>();
}

// Mock para app-navigation
@Component({
  selector: 'app-navigation',
  template: '',
  standalone: true,
})
class NavigationComponentMock {
  @Input() menuItems: any[];
  @Input() showAddButton: boolean;
  @Output() onMenuItemClick = new EventEmitter<void>();
}

// Mock para app-propiedades-seccion
@Component({
  selector: 'app-propiedades-seccion',
  template: '',
  standalone: true,
})
class PropiedadesSeccionComponentMock {
  @Input() seccion: any;
  @Output() seccionCambiada = new EventEmitter<any>();
}

// Mock para app-contenido-editor
@Component({
  selector: 'app-contenido-editor',
  template: '',
  standalone: true,
})
class ContenidoEditorComponentMock {
  @Input() paginaId: number;
  @Input() modoEdicion: string;
  @Input() contenidoExistente: any;
  @Output() contenidoCreado = new EventEmitter<any>();
}

describe('CrearModificarPaginasComponent', () => {
  let component: CrearModificarPaginasComponent;
  let fixture: ComponentFixture<CrearModificarPaginasComponent>;
  let paginasService: PaginasDataService;
  let sanitizer: DomSanitizer;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let matDialog: MatDialog;

  beforeEach(waitForAsync(() => {
    const mockActivatedRoute = {
      paramMap: {
        subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: () => {} })
      },
      parent: {
        snapshot: {
          params: { nombre: 'testAdmin' }
        }
      }
    };

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        DragDropModule,
        ScrollingModule,
        BrowserAnimationsModule,
        CrearModificarPaginasComponent,
        TitleComponentMock,
        NavigationComponentMock,
        PropiedadesSeccionComponentMock,
        ContenidoEditorComponentMock,
      ],
      declarations: [],
      providers: [
        PaginasDataService,
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        },
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustResourceUrl: jasmine
              .createSpy('bypassSecurityTrustResourceUrl')
              .and.callFake((url) => url),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: jasmine.createSpy('open').and.returnValue({
              afterClosed: () => of(true)
            })
          }
        }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearModificarPaginasComponent);
    component = fixture.componentInstance;
    paginasService = TestBed.inject(PaginasDataService);
    sanitizer = TestBed.inject(DomSanitizer);
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    matDialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('debería inicializarse en modo creación si no hay paginaId', () => {
    // Mock del paramMap para que devuelva null (modo creación)
    (activatedRoute.paramMap.subscribe as jasmine.Spy).and.callFake((callback) => {
      callback({
        get: (key: string) => null
      });
      return { unsubscribe: () => {} };
    });

    component.ngOnInit();

    expect(component.paginaId).toBeNull();
    expect(component.modoEdicion).toBeFalse();
    expect(component.menuItems).toEqual([]);
    expect(component.pagina).toBeInstanceOf(Pagina);
  });

  it('debería inicializarse en modo edición y cargar página si hay paginaId', waitForAsync(() => {
    const mockPagina = new Pagina();
    mockPagina.id = 1;
    mockPagina.nombre = 'Página de prueba';
    mockPagina.estado = 1;
    spyOn(paginasService, 'getPorId').and.returnValue(of(mockPagina));

    // Mock del paramMap para que devuelva '1'
    (activatedRoute.paramMap.subscribe as jasmine.Spy).and.callFake((callback) => {
      callback({
        get: (key: string) => '1'
      });
      return { unsubscribe: () => {} };
    });

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.modoEdicion).toBeTrue();
    expect(paginasService.getPorId).toHaveBeenCalledWith(1);
    expect(component.pagina.id).toBe(1);
    expect(component.pagina.nombre).toBe('Página de prueba');
    expect(component.pagina.estado).toBe(1);
    expect(component.menuItems).toEqual([
      { path: './', label: 'Edición' },
      { path: './recursos', label: 'Recursos' },
    ]);
  }));

  it('debería alternar modo preview y resetear selección', () => {
    component.seccionSeleccionada = 0;
    component.panelAbierto = true;
    spyOn(component.cdr, 'detectChanges');

    component.togglePreview();
    expect(component.modoPreview).toBeTrue();
    expect(component.seccionSeleccionada).toBeNull();
    expect(component.contenidoSeleccionado).toBeNull();
    expect(component.panelAbierto).toBeFalse();
    expect(component.cdr.detectChanges).toHaveBeenCalled();

    component.togglePreview();
    expect(component.modoPreview).toBeFalse();
  });

  it('debería agregar una nueva sección', () => {
    component.agregarSeccion();

    expect(component.pagina.secciones.length).toBe(1);
    expect(component.pagina.secciones[0].nombre).toBe('Sección 1');
    expect(component.pagina.secciones[0].orden).toBe(1);
    expect(component.seccionSeleccionada).toBe(0);
    expect(component.panelAbierto).toBeTrue();
  });

  it('debería eliminar una sección con confirmación', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.pagina.secciones = [new Seccion()];
    component.seccionSeleccionada = 0;
    component.panelAbierto = true;

    component.eliminarSeccion(0);

    expect(component.pagina.secciones.length).toBe(0);
    expect(component.seccionSeleccionada).toBeNull();
    expect(component.panelAbierto).toBeFalse();
  });

  it('debería reorganizar secciones al soltar (drag and drop)', () => {
    component.pagina.secciones = [
      { ...new Seccion(), nombre: 'Sección 1', orden: 1 },
      { ...new Seccion(), nombre: 'Sección 2', orden: 2 },
    ];

    const event = {
      previousIndex: 0,
      currentIndex: 1,
    } as CdkDragDrop<string[]>;

    component.reorganizarSecciones(event);

    expect(component.pagina.secciones[0].nombre).toBe('Sección 2');
    expect(component.pagina.secciones[0].orden).toBe(1);
    expect(component.pagina.secciones[1].nombre).toBe('Sección 1');
    expect(component.pagina.secciones[1].orden).toBe(2);
  });

  it('debería agregar nuevo contenido a una sección', () => {
    component.pagina.secciones = [new Seccion()];
    const event = new Event('click');
    spyOn(event, 'stopPropagation');

    component.agregarContenido(0, event);

    expect(component.seccionSeleccionada).toBe(0);
    expect(component.contenidoSeleccionado).toEqual({ seccionIndex: 0, contenidoIndex: null });
    expect(component.panelAbierto).toBeTrue();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('debería eliminar contenido con confirmación', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.pagina.secciones = [new Seccion()];
    component.pagina.secciones[0].contenido = [new Texto()];
    const event = new Event('click');
    spyOn(event, 'stopPropagation');

    component.eliminarContenido(0, 0, event);

    expect(component.pagina.secciones[0].contenido.length).toBe(0);
    expect(component.seccionSeleccionada).toBeNull();
    expect(component.contenidoSeleccionado).toBeNull();
    expect(component.panelAbierto).toBeFalse();
  });

  it('debería reorganizar contenido dentro de una sección', () => {
    component.pagina.secciones = [new Seccion()];
    component.pagina.secciones[0].contenido = [
      { ...new Texto(), orden: 1, descripcion: 'Texto 1' },
      { ...new Texto(), orden: 2, descripcion: 'Texto 2' },
    ];

    const event = {
      previousIndex: 0,
      currentIndex: 1,
    } as CdkDragDrop<string[]>;

    component.reorganizarContenido(0, event);

    expect(component.pagina.secciones[0].contenido[0].descripcion).toBe('Texto 2');
    expect(component.pagina.secciones[0].contenido[0].orden).toBe(1);
    expect(component.pagina.secciones[0].contenido[1].descripcion).toBe('Texto 1');
    expect(component.pagina.secciones[0].contenido[1].orden).toBe(2);
  });

  // Tests corregidos para el método save() personalizado
  it('debería crear una nueva página', waitForAsync(() => {
    const mockResponse = { id: 1, nombre: 'Nueva Página' };
    spyOn(paginasService, 'crear').and.returnValue(of(mockResponse));
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    // Configurar el componente en modo creación
    component.paginaId = null;
    component.pagina.nombre = 'Nueva Página';

    component.save();

    fixture.whenStable().then(() => {
      expect(component.guardando).toBeFalse();
      expect(paginasService.crear).toHaveBeenCalledWith(component.pagina);
      expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
        data: jasmine.objectContaining({
          mensaje: 'Página guardada correctamente'
        })
      }));
      expect(router.navigate).toHaveBeenCalledWith(['../modificar', 1], { relativeTo: activatedRoute });
      expect(component.paginaId).toBe(1);
      expect(component.pagina.id).toBe(1);
    });
  }));

  it('debería actualizar una página existente', waitForAsync(() => {
    component.paginaId = 1;
    component.pagina.id = 1;
    spyOn(paginasService, 'actualizar').and.returnValue(of({}));

    component.save();

    fixture.whenStable().then(() => {
      expect(component.guardando).toBeFalse();
      expect(paginasService.actualizar).toHaveBeenCalledWith(component.pagina);
      expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
        data: jasmine.objectContaining({
          mensaje: 'Página guardada correctamente'
        })
      }));
    });
  }));

  it('debería manejar error al crear página', () => {
    spyOn(paginasService, 'crear').and.returnValue(throwError(() => new Error('Error al crear')));

    component.save();

    expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
      data: jasmine.objectContaining({
        mensaje: 'Error al guardar la página: Error al crear'
      })
    }));
    expect(component.guardando).toBeFalse();
  });

  it('debería identificar correctamente un video directo', () => {
    expect(component.esVideoDirecto('video.mp4')).toBeTrue();
    expect(component.esVideoDirecto('https://youtube.com/watch?v=123')).toBeFalse();
  });

  it('debería convertir URL de YouTube a formato embed', () => {
    const youtubeUrl = 'https://www.youtube.com/watch?v=12345678901';
    const embedUrl = component.getEmbedUrl(youtubeUrl);
    expect(embedUrl).toBe('https://www.youtube.com/embed/12345678901');
  });

  it('debería sanitizar URL de video', () => {
    const video = new Video();
    video.recurso = {
      id: 1,
      url: 'https://www.youtube.com/watch?v=12345678901',
      tipo: 1,
      nombre: 'Video',
      formato: 'mp4',
      size: 1000,
      creationDate: null,
      pagina: null,
    };
    const url = component.obtenerUrlVideo(video);
    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('https://www.youtube.com/embed/12345678901');
  });

  it('debería generar estilos para una sección', () => {
    const seccion = new Seccion();
    seccion.estilos.backgroundColor = '#f0f0f0';
    seccion.estilos.marginTop = 10;

    const estilos = component.generarEstilosSeccion(seccion);

    expect(estilos['background-color']).toBe('#f0f0f0');
    expect(estilos['margin-top']).toBe('10px');
    expect(estilos['width']).toBe('100%');
  });

  it('debería generar estilos para un contenido de texto', () => {
    const texto = new Texto();
    texto.fontSize = 18;
    texto.color = '#333333';

    const estilos = component.generarEstilosTextoEspecificos(texto);

    expect(estilos['font-size']).toBe('18px');
    expect(estilos['color']).toBe('#333333');
  });

 it('debería generar estilos específicos para imágenes', () => {
    const imagen = new Imagen();
    imagen.objectFit = 'cover';
    imagen.estilos.width = '300px';
    imagen.estilos.height = '200px';

    const estilos = component.generarEstilosImagenEspecificos(imagen);

    expect(estilos['object-fit']).toBe('cover');
    expect(estilos['width']).toBe('300px');
    expect(estilos['height']).toBe('200px');
  });

it('debería generar estilos específicos para enlaces', () => {
    const enlace = new Enlace();
    enlace.color = '#ff0000';
    enlace.fontSize = 20;
    enlace.estilos.textAlign = 'center';

    const estilos = component.generarEstilosEnlaceEspecificos(enlace);

    expect(estilos['color']).toBe('#ff0000');
    expect(estilos['font-size']).toBe('20px');
    expect(estilos['text-align']).toBe('center');
  });



});