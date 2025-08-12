import { ComponentFixture, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { TarifasActivasInactivasComponent } from './tarifas-activas-inactivas.component';
import { Tarifa } from '../../../../models/tarifa.model';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TarifaDataService } from '../../../../service/data/tarifa-data.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TarifasActivasInactivasComponent', () => {
  let component: TarifasActivasInactivasComponent;
  let fixture: ComponentFixture<TarifasActivasInactivasComponent>;

  const mockTarifaService = {
    listarPorEstado: jasmine.createSpy('listarPorEstado').and.returnValue(of([])),
    editarEstadoDeTarifa: jasmine.createSpy('editarEstadoDeTarifa').and.returnValue(of({ id: 1, estado: 0 })),
    getPorId: jasmine.createSpy('getPorId').and.returnValue(of({ localidad: null })),
    borrarTarifa: jasmine.createSpy('borrarTarifa').and.returnValue(of(null)),
    ver: jasmine.createSpy('ver').and.returnValue(of({})),
    tieneTicketsAsociados: jasmine.createSpy('tieneTicketsAsociados').and.returnValue(of(false))
  };

  const mockRouter = jasmine.createSpyObj('Router', ['navigate', 'url']);
  mockRouter.url = '/activas';

  const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
  const mockDialogRef = {
    afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(true))
  };
  mockDialog.open.and.returnValue(mockDialogRef);

  const mockActivatedRoute = {
    parent: {
      parent: {
        paramMap: of({ get: (key) => key === 'nombre' ? 'admin123' : null })
      },
      paramMap: of({
        get: (key) => {
          if (key === 'idTemporada') return '1';
          if (key === 'idEvento') return '2';
          return null;
        }
      })
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarifasActivasInactivasComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: TarifaDataService, useValue: mockTarifaService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TarifasActivasInactivasComponent);
    component = fixture.componentInstance;

    // Espiamos openMensaje para no depender del diálogo real
    spyOn(component, 'openMensaje').and.returnValue(of(true));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test corregido para tarifas activas (estado 0)
it('debe cargar tarifas activas (estado 0)', () => {
  const mockTarifas = [{ id: 1, estado: 0 }] as Tarifa[];
  const mockLocalidadId = 1;
  const mockEstado = 0;

  component.idLocalidad = mockLocalidadId; // Usamos idLocalidad en lugar de idEvento
  component.esRutaActivos = true; // Ruta activas → estado = 0

  mockTarifaService.listarPorEstado.and.returnValue(of(mockTarifas));

  component.cargarTarifas();

  expect(mockTarifaService.listarPorEstado).toHaveBeenCalledWith(mockLocalidadId, mockEstado);
  expect(component.tarifas).toEqual(mockTarifas);
  expect(component.cargando).toBeFalse();
});

// Test corregido para tarifas inactivas (estado 1)
it('debe cargar tarifas inactivas (estado 1)', () => {
  const mockTarifas = [{ id: 2, estado: 1 }] as Tarifa[];
  const mockLocalidadId = 1;
  const mockEstado = 1;

  component.idLocalidad = mockLocalidadId; // Usamos idLocalidad en lugar de idEvento
  component.esRutaActivos = false; // Ruta inactivas → estado = 1

  mockTarifaService.listarPorEstado.and.returnValue(of(mockTarifas));

  component.cargarTarifas();

  expect(mockTarifaService.listarPorEstado).toHaveBeenCalledWith(mockLocalidadId, mockEstado);
  expect(component.tarifas).toEqual(mockTarifas);
  expect(component.cargando).toBeFalse();
});


  it('debe manejar error al cargar tarifas', () => {
    mockTarifaService.listarPorEstado.and.returnValue(throwError(() => new Error('Error')));

    component.cargarTarifas();

    expect(mockTarifaService.listarPorEstado).toHaveBeenCalled();
    expect(component.cargando).toBeFalse();
  });

  it('debe cambiar el estado de una tarifa exitosamente', fakeAsync(() => {
    const tarifa = { id: 1, estado: 1 } as Tarifa;
    const updated = { id: 1, estado: 0 } as Tarifa;
    component.tarifas = [tarifa];

    spyOn(component, 'cargarTarifas');

    mockTarifaService.editarEstadoDeTarifa.and.returnValue(of(updated));

    component.cambiarEstado(tarifa);
    tick();

    expect(mockTarifaService.editarEstadoDeTarifa).toHaveBeenCalledWith(tarifa);
    expect(component.openMensaje).toHaveBeenCalledWith('Estado de la tarifa cambiado correctamente');
    expect(component.cargarTarifas).toHaveBeenCalled();
  }));

  it('debe manejar error al cambiar estado de tarifa', fakeAsync(() => {
    const tarifa = { id: 1, estado: 1 } as Tarifa;
    component.tarifas = [tarifa];
    const estadoOriginal = tarifa.estado;

    // Simulamos el cambio de estado que hace el componente antes de llamar al servicio
    tarifa.estado = tarifa.estado === 1 ? 0 : 1;

    mockTarifaService.editarEstadoDeTarifa.and.returnValue(throwError(() => new Error('Error')));

    component.cambiarEstado(tarifa);
    tick();

    expect(component.openMensaje).toHaveBeenCalledWith('No se pudo cambiar el estado');
    expect(tarifa.estado).toBe(1);
  }));

  it('no debe eliminar si la tarifa tiene localidad asociada', fakeAsync(() => {
  // Resetear spies
  mockTarifaService.getPorId.calls.reset();
  mockTarifaService.borrarTarifa.calls.reset();
  (component.openMensaje as jasmine.Spy).calls.reset();

  // Mock tarifa con localidad
  const tarifaConLocalidad = {
    id: 1,
    nombre: 'Tarifa Test',
    localidad: { id: 1, nombre: 'Localidad 1' }
  } as Tarifa;

  // Mock de los mensajes: primero confirmación (true), luego el mensaje de error
  (component.openMensaje as jasmine.Spy).and.returnValues(of(true), of());

  // Mocks de servicios
  mockTarifaService.getPorId.and.returnValue(of(tarifaConLocalidad));
  
  // Ejecutar
  component.eliminarTarifa(1);
  tick();

  // Verificaciones
  expect(component.openMensaje).toHaveBeenCalledWith("¿Desea borrar la tarifa?", true);
  expect(mockTarifaService.getPorId).toHaveBeenCalledWith(1);
  expect(component.openMensaje).toHaveBeenCalledWith("No se puede eliminar la tarifa porque tiene una localidad asociada");
  expect(mockTarifaService.borrarTarifa).not.toHaveBeenCalled(); 
}));


  it('debe eliminar tarifa sin localidades asociadas', fakeAsync(() => {
    (component.openMensaje as jasmine.Spy).and.returnValue(of(true));

    mockTarifaService.getPorId.and.returnValue(of({ localidad: null } as Tarifa));
    mockTarifaService.borrarTarifa.and.returnValue(of(null));

    spyOn(component, 'refrescar');

    component.eliminarTarifa(1);
    tick();

    expect(component.openMensaje).toHaveBeenCalledWith("¿Desea borrar la tarifa?", true);
    expect(mockTarifaService.getPorId).toHaveBeenCalledWith(1);
    expect(mockTarifaService.borrarTarifa).toHaveBeenCalledWith(1);
    expect(component.openMensaje).toHaveBeenCalledWith("Se borró exitosamente la tarifa");
    expect(component.refrescar).toHaveBeenCalled();
  }));

  it('debe manejar error al obtener tarifa para eliminar', fakeAsync(() => {
    (component.openMensaje as jasmine.Spy).calls.reset();
    mockTarifaService.borrarTarifa.calls.reset();

    (component.openMensaje as jasmine.Spy).and.returnValue(of(true));
    mockTarifaService.getPorId.and.returnValue(throwError(() => new Error('Error')));

    component.eliminarTarifa(1);
    tick();
    tick();
    flush();

    expect(component.openMensaje).toHaveBeenCalledWith("No se pudo obtener la información de la tarifa");
    expect(mockTarifaService.borrarTarifa).not.toHaveBeenCalled();
  }));

  // Test corregido para navegación a edición
it('debe navegar al formulario de edición de tarifa', fakeAsync(() => {
  component.nombre = 'admin123';
  component.idTemporada = 1;
  component.idEvento = 2;
  component.idDia = 3;
  component.idLocalidad = 4;
  component.esRutaPorEvento = false;

  const tarifa = { id: 5 } as Tarifa;

  mockTarifaService.tieneTicketsAsociados.and.returnValue(of(false)); // aseguramos el retorno

  component.editarTarifa(tarifa);

  tick(); // ejecuta el observable

  expect(mockRouter.navigate).toHaveBeenCalledWith([
    '/administradores/admin',
    'admin123',
    'temporada',
    1,
    'evento',
    2,
    'dia',
    3,
    'localidades',
    4,
    'tarifas',
    'editar',
    5
  ]);
}));


  it('debe seleccionar el ítem si no está seleccionado', () => {
    component.selectedItem = null;
    component.toggleItem(2);
    expect(component.selectedItem).toBe(2);
  });

  it('debe deseleccionar el ítem si ya estaba seleccionado', () => {
    component.selectedItem = 2;
    component.toggleItem(2);
    expect(component.selectedItem).toBeNull();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  });
});
