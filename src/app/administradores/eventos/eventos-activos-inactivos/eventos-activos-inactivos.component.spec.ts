import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoDataService } from '../../../service/data/evento-data.service';
import { MatDialog } from '@angular/material/dialog';
import { EventosActivosInactivosComponent } from './eventos-activos-inactivos.component';
import { Evento } from '../../../models/evento.model';

describe('EventosActivosComponent', () => {
  let component: EventosActivosInactivosComponent;
  let fixture: ComponentFixture<EventosActivosInactivosComponent>;

  const mockEventoService = {
    listarPorEstado: jasmine.createSpy('listarPorEstado').and.returnValue(of([])),
    editarEstadoDeEvento: jasmine.createSpy('editarEstadoDeEvento').and.returnValue(of({ id: 1, estado: 0 })),
    getPorId: jasmine.createSpy('getPorId').and.returnValue(of({ dias: [] })),
    delete: jasmine.createSpy('delete').and.returnValue(of(null)),
    borrarEvento: jasmine.createSpy('borrarEvento').and.returnValue(of(null))
  };

  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
  const mockDialogRef = {
    afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(true))
  };
  mockDialog.open.and.returnValue(mockDialogRef);

  const mockEventos = [
  {
    id: 3,
    nombre: 'Evento Oculto 1',
    estado: 1,
    tipo: { nombre: 'Danza' },
    tipoNombre: 'Danza',
    pulep: '',
    artistas: '',
    recomendaciones: '',
    video: '',
    fechaApertura: new Date(),
    venue: null,
    organizadores: [],
    dias: [],
    temporada: null
  },
  {
    id: 4,
    nombre: 'Evento Oculto 2',
    estado: 1,
    tipo: null,
    tipoNombre: '',
    pulep: '',
    artistas: '',
    recomendaciones: '',
    video: '',
    fechaApertura: new Date(),
    venue: null,
    organizadores: [],
    dias: [],
    temporada: null
  }
];


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosActivosInactivosComponent],
      providers: [
        { provide: ActivatedRoute, useValue: ActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: EventoDataService, useValue: mockEventoService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventosActivosInactivosComponent);
    component = fixture.componentInstance;

    spyOn(component, 'openMensaje').and.returnValue(of(true));
    component.nombre = 'admin123';
    component.idTemporada = 1;
  });

  it('should create', fakeAsync(() => {
    tick();
    expect(component).toBeTruthy();
  }));


  describe('Carga de eventos por estado', () => {
  it('debería cargar eventos en estado 0 (creados)', fakeAsync(() => {
    // Configurar el estado actual como 0 (creados)
    component.estadoActual = 0;
    
    // Mock de eventos en estado 0
    const mockEventosCreados = [
      {
        id: 1,
        nombre: 'Evento Creado 1',
        estado: 0,
        tipo: { nombre: 'Música' },
        tipoNombre: 'Música',
        pulep: '',
        artistas: '',
        recomendaciones: '',
        video: '',
        fechaApertura: new Date(),
        venue: null,
        organizadores: [],
        dias: [],
        temporada: null
      },
      {
        id: 2,
        nombre: 'Evento Creado 2',
        estado: 0,
        tipo: null,
        tipoNombre: '',
        pulep: '',
        artistas: '',
        recomendaciones: '',
        video: '',
        fechaApertura: new Date(),
        venue: null,
        organizadores: [],
        dias: [],
        temporada: null
      }
    ];
    
    mockEventoService.listarPorEstado.and.returnValue(of(mockEventosCreados));
    
    component.cargarEventos();
    tick();
    
    expect(mockEventoService.listarPorEstado).toHaveBeenCalledWith(component.idTemporada, 0);
    expect(component.eventos.length).toBe(2);
    expect(component.eventos[0].estado).toBe(0);
    expect(component.eventos[1].estado).toBe(0);
    expect(component.cargando).toBeFalse();
  }));

  it('debería cargar eventos en estado 1 (ocultos)', fakeAsync(() => {
    // Configurar el estado actual como 1 (ocultos)
    component.estadoActual = 1;
    
    // Mock de eventos en estado 1
    const mockEventosOcultos = [
      {
        id: 3,
        nombre: 'Evento Oculto 1',
        estado: 1,
        tipo: { nombre: 'Danza' },
        tipoNombre: 'Danza',
        pulep: '',
        artistas: '',
        recomendaciones: '',
        video: '',
        fechaApertura: new Date(),
        venue: null,
        organizadores: [],
        dias: [],
        temporada: null
      },
      {
        id: 4,
        nombre: 'Evento Oculto 2',
        estado: 1,
        tipo: null,
        tipoNombre: '',
        pulep: '',
        artistas: '',
        recomendaciones: '',
        video: '',
        fechaApertura: new Date(),
        venue: null,
        organizadores: [],
        dias: [],
        temporada: null
      }
    ];
    
    mockEventoService.listarPorEstado.and.returnValue(of(mockEventosOcultos));
    
    component.cargarEventos();
    tick();
    
    expect(mockEventoService.listarPorEstado).toHaveBeenCalledWith(component.idTemporada, 1);
    expect(component.eventos.length).toBe(2);
    expect(component.eventos[0].estado).toBe(1);
    expect(component.eventos[1].estado).toBe(1);
    expect(component.cargando).toBeFalse();
  }));
});


  it('debe manejar error al cargar eventos', fakeAsync(() => {
    mockEventoService.listarPorEstado.and.returnValue(throwError(() => new Error('Error')));

    component.cargarEventos();
    tick();

    expect(component.cargando).toBeFalse();
  }));

  it('debe cambiar estado del evento y recargar eventos', fakeAsync(() => {
    const mockEvento = { id: 1, estado: 1 } as any;
    component.eventos = [mockEvento];

    const mockResponse = { id: 1, estado: 0 } as any;
    mockEventoService.editarEstadoDeEvento.and.returnValue(of(mockResponse));

    spyOn(component, 'cargarEventos').and.callFake(() => {
      component.eventos = [mockResponse];
    });

    component.cambiarEstado(mockEvento);
    tick();

    expect(mockEventoService.editarEstadoDeEvento).toHaveBeenCalled();
    expect(component.eventos[0]).toEqual(mockResponse);
  }));

  it('debe navegar al formulario de edición', fakeAsync(() => {
    const mockEvento = { id: 10 } as any;
    component.nombre = 'admin123';
    component.idTemporada = 42;

    component.editarEvento(mockEvento);
    tick();

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/administradores/admin',
      'admin123',
      'temporada',
      42,
      'eventos',
      'editar',
      10
    ]);
  }));

  it('debe alternar selección de ítem', fakeAsync(() => {
    component.selectedItem = null;
    component.toggleItem(2);
    tick();
    expect(component.selectedItem).toBe(2);

    component.toggleItem(2);
    tick();
    expect(component.selectedItem).toBeNull();
  }));

  it('debe eliminar un evento sin días', fakeAsync(() => {
    const mockEvento = { id: 99 };
    component.idTemporada = 1;

    mockEventoService.getPorId.and.returnValue(of({ dias: [] }));
    mockEventoService.borrarEvento.and.returnValue(of(null));

    component.eliminarEvento(mockEvento.id);
    tick();

    expect(mockEventoService.getPorId).toHaveBeenCalledWith(99);
    expect(mockEventoService.borrarEvento).toHaveBeenCalledWith(99);
    expect(component.openMensaje).toHaveBeenCalledWith('Se borró exitosamente el evento');
  }));

  it('no debe eliminar un evento con días', fakeAsync(() => {
    mockEventoService.getPorId.calls.reset();
    mockEventoService.delete.calls.reset();
    (component.openMensaje as jasmine.Spy).calls.reset();

    (component.openMensaje as jasmine.Spy).and.returnValues(of(true), of(undefined));

    const eventoConDias = { dias: [{}] };
    mockEventoService.getPorId.and.returnValue(of(eventoConDias));

    component.eliminarEvento(1);
    tick();
    flush();

    expect(mockEventoService.getPorId).toHaveBeenCalledWith(1);
    expect(component.openMensaje).toHaveBeenCalledWith('¿Desea borrar el evento?', true);
    expect(component.openMensaje).toHaveBeenCalledWith(
      'No se puede eliminar el evento porque tiene días asociados'
    );
    expect(mockEventoService.delete).not.toHaveBeenCalled();
  }));

  it('debe manejar error al obtener evento para eliminar', fakeAsync(() => {
    mockEventoService.getPorId.and.returnValue(throwError(() => new Error('Error')));

    component.eliminarEvento(1);
    tick();

    expect(component.openMensaje).toHaveBeenCalledWith('No se pudo obtener la información del evento');
  }));

  it('debe manejar error al eliminar evento', fakeAsync(() => {
    mockEventoService.getPorId.and.returnValue(of({ dias: [] }));
    mockEventoService.borrarEvento.and.returnValue(throwError(() => new Error('Error')));

    component.eliminarEvento(1);
    tick();

    expect(component.openMensaje).toHaveBeenCalledWith('Sucedió un error, por favor vuelva a intentar');
  }));
});