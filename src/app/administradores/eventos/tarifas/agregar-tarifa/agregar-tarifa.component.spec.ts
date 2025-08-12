import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AgregarTarifaComponent } from './agregar-tarifa.component';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { TarifaDataService } from '../../../../service/data/tarifa-data.service';
import { EventoDataService } from '../../../../service/data/evento-data.service';
import { LocalidadDataService } from '../../../../service/data/localidad-data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { Tarifa } from '../../../../models/tarifa.model';
import { Evento } from '../../../../models/evento.model';
import { Localidad } from '../../../../models/localidad.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AgregarTarifaComponent', () => {
  let component: AgregarTarifaComponent;
  let fixture: ComponentFixture<AgregarTarifaComponent>;
  let mockTarifaService: jasmine.SpyObj<TarifaDataService>;
  let mockEventoService: jasmine.SpyObj<EventoDataService>;
  let mockLocalidadService: jasmine.SpyObj<LocalidadDataService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockTarifaService = jasmine.createSpyObj('TarifaDataService', ['getPorId', 'crear', 'editarTarifa']);
    mockEventoService = jasmine.createSpyObj('EventoDataService', ['getPorId']);
    mockLocalidadService = jasmine.createSpyObj('LocalidadDataService', ['getPorId']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });
    mockDialog.open.and.returnValue(dialogRefSpyObj);

    // Configurar mocks con datos correctos
    const tarifaMock: Tarifa = {
      id: 1,
      nombre: 'Tarifa Test',
      precio: 10000,
      servicio: 1000,
      iva: 0.19,
      estado: 1,
      localidad: null
    };
    
    mockTarifaService.crear.and.returnValue(of(tarifaMock));
    mockTarifaService.editarTarifa.and.returnValue(of(tarifaMock));
    mockTarifaService.getPorId.and.returnValue(of(tarifaMock));
    mockEventoService.getPorId.and.returnValue(of(new Evento()));
    mockLocalidadService.getPorId.and.returnValue(of(new Localidad()));

    mockActivatedRoute = {
      snapshot: {},
      paramMap: of(convertToParamMap({
        idEvento: '1',
        idTemporada: '2',
        id: null
      })),
      parent: {
        paramMap: of(convertToParamMap({
          nombre: 'testAdmin'
        }))
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        AgregarTarifaComponent,
        HttpClientTestingModule // Añadir esto
      ],
      providers: [
        { provide: TarifaDataService, useValue: mockTarifaService },
        { provide: EventoDataService, useValue: mockEventoService },
        { provide: LocalidadDataService, useValue: mockLocalidadService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarTarifaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('no debería proceder si el formulario es inválido', () => {
    component.tarifa = new Tarifa(); // vacío
    component.crearTarifa();
    expect(component.loading).toBeFalse();
  });

  it('debería mostrar el diálogo de confirmación si el precio es menor que el servicio', () => {
    component.tarifa = new Tarifa();
    component.tarifa.nombre = 'VIP';
    component.tarifa.precio = 1000;
    component.tarifa.servicio = 2000;
    component.tarifa.iva = 0.2;

    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true) });
    mockDialog.open.and.returnValue(dialogRefSpyObj);

    component.crearTarifa();

    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('debería llamar a procederConGuardado si no se necesita confirmación', fakeAsync(() => {
    component.tarifa = new Tarifa();
    component.tarifa.nombre = 'General';
    component.tarifa.precio = 5000;
    component.tarifa.servicio = 1000;
    component.tarifa.iva = 0.1;

    spyOn(component, 'procederConGuardado');
    component.crearTarifa();
    tick();
    expect(component.procederConGuardado).toHaveBeenCalled();
  }));

  it('debería navegar después de la creación exitosa', fakeAsync(() => {
    component.tarifa = new Tarifa();
    component.tarifa.nombre = 'VIP';
    component.tarifa.precio = 5000;
    component.tarifa.servicio = 1000;
    component.tarifa.iva = 0.2;

    component.crearNuevaTarifa();
    tick();

    expect(mockTarifaService.crear).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalled();
  }));

  it('debería actualizar la tarifa en modo edición', fakeAsync(() => {
    component.modoEdicion = true;
    component.esRutaPorEvento = true; // Asegurar que use esta ruta
    component.tarifa = new Tarifa();
    component.nombre = 'testAdmin';
    component.eventoId = 1;
    component.temporadaId = 2;
    component.localidadId = 2; // Añadir esto para que coincida con el mock

    component.actualizarTarifa();
    tick();

    expect(mockTarifaService.editarTarifa).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/administradores/admin', 'testAdmin', 'temporada', 2, 'evento', 1, 'localidad', 2, 'tarifas'
    ]);
}));

  it('debería mostrar error al fallar la carga de la tarifa', fakeAsync(() => {
    mockTarifaService.getPorId.and.returnValue(throwError(() => new Error('error')));

    component.nombre = 'testAdmin';
    component.eventoId = 1;
    component.temporadaId = 2;

    component.cargarTarifa(123);
    tick();

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/administradores/admin', 'testAdmin', 'temporada', 2, 'evento', 1, 'tarifas'
    ]);
  }));

  it('debería formatear el número con separador de miles', () => {
    const result = component.formatNumber(123456);
    expect(result).toBe('123.456');
  });
});