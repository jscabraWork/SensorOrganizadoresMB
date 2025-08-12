import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AgregarTicketsComponent } from './agregar-tickets.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { TicketDataService } from '../../../../../../service/data/ticket-data.service';
import { LocalidadDataService } from '../../../../../../service/data/localidad-data.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { Ticket } from '../../../../../../models/ticket.model';
import { Localidad } from '../../../../../../models/localidad.model';
import { MensajeComponent } from '../../../../../../mensaje/mensaje.component';
import { TarifaDataService } from '../../../../../../service/data/tarifa-data.service';

fdescribe('AgregarTicketsComponent', () => {
  let component: AgregarTicketsComponent;
  let fixture: ComponentFixture<AgregarTicketsComponent>;
  let mockTicketService: jasmine.SpyObj<TicketDataService>;
  let mockLocalidadService: jasmine.SpyObj<LocalidadDataService>;
  let mockTarifaService: jasmine.SpyObj<TarifaDataService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockActivatedRoute: any;

  const mockLocalidad: Localidad = {
    id: 1,
    nombre: 'Localidad Test',
    estado: 0,
    aporte_minimo: 0,
    tipo: 0,
    tarifas: [],
    dias: []
    // otras propiedades según tu modelo Localidad
  };

  const mockTicket: Ticket = {
    id: 1,
    estado: 0,
    tipo: 0,
    numero: 'A100',
    ordenes: [],
    servicios: [],
    asientos: [],
    palco: null,
    cliente: null,
    seguro: null,
    ingresos: null,
    tarifa: null,
    localidad: mockLocalidad,
    personasPorTicket: 1
  };

  beforeEach(async () => {
    mockTarifaService = jasmine.createSpyObj('TarifaDataService', ['listarPorLocalidadId']);
    mockTicketService = jasmine.createSpyObj('TicketDataService', ['crearTicketsNumerados', 'getPorId']);
    mockLocalidadService = jasmine.createSpyObj('LocalidadDataService', ['getPorId']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);


    mockActivatedRoute = {
      paramMap: of({
        get: (key: string) => {
          const params: { [key: string]: string } = {
            'idEvento': '1',
            'idTemporada': '1',
            'idLocalidad': '1',
            'idDia': '1'
          };
          return params[key];
        },
        has: (key: string) => {
          const params: { [key: string]: string } = {
            'idEvento': '1',
            'idTemporada': '1',
            'idLocalidad': '1',
            'idDia': '1'
          };
          return key in params;
        }
      }),
      parent: {
        paramMap: of({
          get: (key: string) => 'test-admin',
          has: (key: string) => key === 'nombre'
        })
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        RouterTestingModule,
        AgregarTicketsComponent
      ],
      declarations: [],
      providers: [
        { provide: TicketDataService, useValue: mockTicketService },
        { provide: LocalidadDataService, useValue: mockLocalidadService },
        { provide: TarifaDataService, useValue: mockTarifaService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarTicketsComponent);
    component = fixture.componentInstance;

    // Configurar mocks
    mockLocalidadService.getPorId.and.returnValue(of(mockLocalidad));
    mockTicketService.getPorId.and.returnValue(of(mockTicket));
    mockTicketService.crearTicketsNumerados.and.returnValue(of({}));
    mockTarifaService.listarPorLocalidadId.and.returnValue(of([]));
    mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);

    fixture.detectChanges();
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('deberia cargar la localidad al iniciar', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(mockLocalidadService.getPorId).toHaveBeenCalledWith(1);
    expect(component.localidad).toEqual(mockLocalidad);
    expect(component.ticket.localidad).toEqual(mockLocalidad);
  }));

  it('debería manejar el error al cargar la localidad', fakeAsync(() => {
    const error = new Error('Localidad error');
    mockLocalidadService.getPorId.and.returnValue(throwError(() => error));

    spyOn(console, 'error');
    component.ngOnInit();
    tick();

    expect(console.error).toHaveBeenCalledWith('Error al cargar localidad:', error);
  }));

  it('debería cargar el ticket en modo edición', fakeAsync(() => {
    // Configurar ruta con ID de ticket
    mockActivatedRoute.paramMap = of(convertToParamMap({ id: '1' }));

    component.ngOnInit();
    tick();

    expect(component.modoEdicion).toBeTrue();
    expect(mockTicketService.getPorId).toHaveBeenCalledWith(1);
    expect(component.ticket).toEqual(mockTicket);
    expect(component.ticket.numero).toBe('A100');
    expect(component.ticket.tarifa).toEqual(mockTicket.tarifa);
  }));


  it('debería manejar el error al cargar el ticket en modo edicion', fakeAsync(() => {
    const error = new Error('Ticket error');
    mockTicketService.getPorId.and.returnValue(throwError(() => error));
    mockActivatedRoute.paramMap = of(convertToParamMap({ id: '1' }));


    spyOn(console, 'error');
    spyOn(component, 'openMensaje');
    spyOn(component, 'goBack');

    component.ngOnInit();
    tick();

    expect(console.error).toHaveBeenCalledWith('Error al cargar ticket:', error);
    expect(component.openMensaje).toHaveBeenCalledWith('Error al cargar el ticket');
    expect(component.goBack).toHaveBeenCalled();
  }));

  it('debería manejar el cambio de numeración', () => {
    component.numerados = true;
    component.numeroArriba = 10;
    component.numeroAbajo = 1;
    component.letra = 'A';

    component.onNumeradosChange();
    expect(component.numerados).toBeTrue();

    component.numerados = false;
    component.onNumeradosChange();
    expect(component.numerados).toBeFalse();
    expect(component.numeroArriba).toBeNull();
    expect(component.numeroAbajo).toBeNull();
    expect(component.letra).toBe('');
  });

  it('debería manejar la entrada numérica para cantidad de tickets', () => {
    const event = { target: { value: '123abc' } } as unknown as Event;
    component.onInputNumber(event, 'cantidadT');
    expect(component.cantidadTicket).toBe(123);
  });

  it('debería manejar la entrada numérica para cantidad de personas por ticket', () => {
    const event = { target: { value: '2' } } as unknown as Event;
    component.onInputNumber(event, 'cantidadP');
    expect(component.cantidadPersona).toBe(2);
  });

  it('debería manejar la entrada numérica para el número mínimo', () => {
    const event = { target: { value: '10' } } as unknown as Event;
    component.onInputNumber(event, 'minimo');
    expect(component.numeroAbajo).toBe(10);
  });

  it('debería manejar la entrada numérica para el número máximo', () => {
    const event = { target: { value: '20' } } as unknown as Event;
    component.onInputNumber(event, 'maximo');
    expect(component.numeroArriba).toBe(20);
  });

  it('debería validar el formulario antes de crear los tickets', () => {
    component.cantidadTicket = null;
    component.cantidadPersona = null;
    component.numerados = null;

    component.crearOActualizarTicket();

    expect(component.formEnviado).toBeTrue();
    expect(mockTicketService.crearTicketsNumerados).not.toHaveBeenCalled();
  });

  it('debería validar los campos de numerados al crear tickets', () => {
    component.cantidadTicket = 1;
    component.cantidadPersona = 1;
    component.numerados = true;
    component.numeroAbajo = null;
    component.numeroArriba = null;

    component.crearOActualizarTicket();

    expect(mockTicketService.crearTicketsNumerados).not.toHaveBeenCalled();
  });


  it('debería validar que el número mínimo no sea mayor al máximo cuando es numerado', () => {
    component.cantidadTicket = 1;
    component.cantidadPersona = 1;
    component.numerados = true;
    component.numeroAbajo = 10;
    component.numeroArriba = 5;

    spyOn(component, 'openMensaje');
    component.crearOActualizarTicket();

    expect(component.openMensaje).toHaveBeenCalledWith('El número mínimo no puede ser mayor al máximo');
    expect(mockTicketService.crearTicketsNumerados).not.toHaveBeenCalled();
  });


  it('debería crear tickets no numerados correctamente', fakeAsync(() => {
    spyOn(component, 'openMensaje').and.returnValue(of(true));

    component.cantidadTicket = 5;
    component.cantidadPersona = 2;
    component.numerados = false;
    component.numeroArriba = 5;
    component.numeroAbajo = 1;
    component.letra = '';
    component.localidad = mockLocalidad;
    component.localidadId = mockLocalidad.id; // Asegúrate de setear el id

    component.crearTicket();
    tick();

    expect(mockTicketService.crearTicketsNumerados).toHaveBeenCalledWith(
      mockLocalidad.id, // <--- ahora espera el id numérico
      5, // numeroArriba
      1, // numeroAbajo
      '', // letra
      false, // numerados
      2 // cantidadPersona
    );

    expect(component.openMensaje).toHaveBeenCalledWith('5 Tickets agregados a la localidad Localidad Test');
    expect(mockRouter.navigate).toHaveBeenCalled();
  }));



  it('debería crear tickets numerados correctamente', fakeAsync(() => {
    spyOn(component, 'openMensaje').and.returnValue(of(true));

    component.cantidadTicket = 1;
    component.cantidadPersona = 2;
    component.numerados = true;
    component.numeroAbajo = 10;
    component.numeroArriba = 15;
    component.letra = 'A';
    component.localidad = mockLocalidad;
    component.localidadId = mockLocalidad.id; // Asegúrate de setear el id

    component.crearTicket();
    tick();

    expect(mockTicketService.crearTicketsNumerados).toHaveBeenCalledWith(
      mockLocalidad.id, // <--- ahora espera el id numérico
      15, // numeroArriba
      10, // numeroAbajo
      'A', // letra
      true, // numerados
      2 // cantidadPersona
    );

    expect(component.openMensaje).toHaveBeenCalledWith('6 Tickets agregados a la localidad Localidad Test');
    expect(mockRouter.navigate).toHaveBeenCalled();
  }));


  it('debería manejar error al crear ticket', fakeAsync(() => {
    const error = new Error('Creation error');
    mockTicketService.crearTicketsNumerados.and.returnValue(throwError(() => error));

    component.cantidadTicket = 1;
    component.cantidadPersona = 1;
    component.numerados = false;
    component.localidad = mockLocalidad;
    component.ticket = new Ticket();
    component.ticket.localidad = mockLocalidad;

    spyOn(console, 'error');
    component.crearTicket();
    tick();

    expect(console.error).toHaveBeenCalledWith('Error al crear tickets:', error);
  }));


});