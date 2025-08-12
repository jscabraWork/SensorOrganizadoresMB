import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TicketsActivosInactivosComponent } from './tickets-activos-inactivos.component';
import { TicketDataService } from '../../../../../../service/data/ticket-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { Page } from '../../../../../../models/page.mode';
import { Ticket } from '../../../../../../models/ticket.model';
import { Tarifa } from '../../../../../../models/tarifa.model';
import { Localidad } from '../../../../../../models/localidad.model';
import { Orden } from '../../../../../../models/orden.model';
import { Servicio } from '../../../../../../models/servicio.model';
import { By } from '@angular/platform-browser';
import { MockTableComponent } from '../../../../../../test/mock-table.component';
import { MOCK_TICKETS, MOCK_PAGES, MOCK_ASIENTOS, cloneTicket } from '../../../../../../test/mock-ticket-page.helper';
import { TableComponent } from '../../../../../../commons-ui/table/table.component';
import { SearchFilterComponent } from '../../../../../../commons-ui/search-filter/search-filter.component';
import { MockSearchFilterComponent } from '../../../../../../test/mock-search-filter.component';

describe('TicketsActivosInactivosComponent', () => {
  let component: TicketsActivosInactivosComponent;
  let fixture: ComponentFixture<TicketsActivosInactivosComponent>;
  let mockTicketService: jasmine.SpyObj<TicketDataService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<any>>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialogRef.afterClosed.and.returnValue(of(false)); 
    
    mockTicketService = jasmine.createSpyObj('TicketDataService', [
      'listarPorLocalidadYEstado', 
      'buscarPorLocalidadYEstado',
      'eliminarSiNoTieneOrdenes',
      'obtenerHijosDelPalco',
      'editarEstadoTicket'
    ]);
    
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue(mockDialogRef); // IMPORTANTE: Retornar el mockDialogRef
    
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    Object.defineProperty(mockRouter, 'url', {
      get: () => '/admin/evento/disponibles'
    });
    
    mockActivatedRoute = {
      parent: {
        parent: {
          paramMap: of(new Map([['nombre', 'test-admin']]))
        },
        paramMap: of(new Map([
          ['idTemporada', '1'],
          ['idEvento', '1'],
          ['idLocalidad', '1']
        ]))
      }
    };

    await TestBed.configureTestingModule({
      imports: [TicketsActivosInactivosComponent],
      providers: [
        { provide: TicketDataService, useValue: mockTicketService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog },
        { provide: TableComponent, useClass: MockTableComponent },
        { provide: SearchFilterComponent, useClass: MockSearchFilterComponent}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketsActivosInactivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });


  it('debería cargar tickets al inicializar', fakeAsync(() => {
    mockTicketService.listarPorLocalidadYEstado.and.returnValue(of(MOCK_PAGES.SINGLE_TICKET));
    
    component.estadoActual = 0;
    component.cargarTickets();
    tick();
    
    expect(component.totalTickets).toBe(1);
    expect(component.cargando).toBeFalse();
  }));

  it('debería manejar errores al cargar tickets', fakeAsync(() => {
    mockTicketService.listarPorLocalidadYEstado.and.returnValue(throwError(() => new Error('Error')));
    
    component.cargarTickets();
    tick();
    
    expect(component.ticketsPage).toEqual(MOCK_PAGES.EMPTY);
  }));

  it('debería filtrar tickets por ID', fakeAsync(() => {
    mockTicketService.buscarPorLocalidadYEstado.and.returnValue(of(MOCK_TICKETS.DISPONIBLE));
    
    component.filtrar({ search: '1' });
    tick();
    
    expect(component.ticketsPage.content.length).toBe(1);
  }));


  it('debería mostrar mensaje para ID inválido al filtrar', fakeAsync(() => {
    component.estadoActual = 0;
    component.filtrar({ search: 'abc' });
    tick();
    
    expect(mockDialog.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
      data: jasmine.objectContaining({
        mensaje: 'Por favor ingrese un ID válido (número)',
        mostrarBotones: false
      })
    }));
  }));

  it('debería cambiar de página correctamente', () => {
    spyOn(component, 'cargarTickets');
    component.cambiarPagina(2);
    
    expect(component.paginaActual).toBe(2);
    expect(component.cargarTickets).toHaveBeenCalled();
  });

  it('debería procesar correctamente un ticket', () => {
    const processed = component.procesarTicket(MOCK_TICKETS.DISPONIBLE);
    
    expect(processed.numero).toBe('1');
    expect(processed.precioTotal).toBe(101.19);
    expect(processed.personasEnElTicket).toBe(1);
  });

  it('debería navegar al editar un ticket disponible', () => {
    component.editarTicket(MOCK_TICKETS.DISPONIBLE);
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('debería mostrar mensaje al intentar editar palco vendido', fakeAsync(() => {
    component.editarTicket(MOCK_TICKETS.PALCO_VENDIDO);
    tick();
    
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  }));

  it('debería eliminar un ticket después de confirmación', fakeAsync(() => {
    // Configurar el mock para que retorne true (confirmación)
    mockDialogRef.afterClosed.and.returnValue(of(true));
    mockTicketService.eliminarSiNoTieneOrdenes.and.returnValue(of(undefined));
    spyOn(component, 'cargarTickets');
    
    component.eliminarTicket(1);
    tick();
    
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockTicketService.eliminarSiNoTieneOrdenes).toHaveBeenCalledWith(1);
    expect(component.cargarTickets).toHaveBeenCalled();
  }));

  it('no debería eliminar un ticket si no se confirma', fakeAsync(() => {
    // Configurar el mock para que retorne false (no confirmación)
    mockDialogRef.afterClosed.and.returnValue(of(false));
    mockTicketService.eliminarSiNoTieneOrdenes.and.returnValue(of(undefined));
    spyOn(component, 'cargarTickets');
    
    component.eliminarTicket(1);
    tick();
    
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockTicketService.eliminarSiNoTieneOrdenes).not.toHaveBeenCalled();
    expect(component.cargarTickets).not.toHaveBeenCalled();
  }));

  it('debería manejar error al eliminar ticket', fakeAsync(() => {
    mockDialogRef.afterClosed.and.returnValue(of(true));
    mockTicketService.eliminarSiNoTieneOrdenes.and.returnValue(
      throwError(() => ({ error: { message: 'Error al eliminar' } }))
    );
    
    component.eliminarTicket(1);
    tick();
    
    expect(mockDialog.open).toHaveBeenCalledTimes(2); // Una vez para confirmación, otra para error
    expect(component.cargando).toBeFalse();
  }));

  it('debería cargar asientos al expandir un palco', fakeAsync(() => {
    mockTicketService.obtenerHijosDelPalco.and.returnValue(of(MOCK_ASIENTOS.PALCO_COMPLETO));
    
    component.ticketsPage = { ...MOCK_PAGES.SINGLE_TICKET };
    component.ticketsPage.content = [MOCK_TICKETS.PALCO_DISPONIBLE];
    
    component.onExpandRow(MOCK_TICKETS.PALCO_DISPONIBLE);
    tick();
    
    expect(mockTicketService.obtenerHijosDelPalco).toHaveBeenCalledWith(3);
    expect(component.ticketsPage.content[0].asientos?.length).toBe(2);
  }));

  it('debería manejar error al cargar asientos del palco', fakeAsync(() => {
    const ticket: Ticket = {
      id: 1,
      numero: '1',
      estado: 0, 
      tipo: 1, // Es palco
      ordenes: [] as Orden[],
      servicios: [] as Servicio[],
      asientos: [] as Ticket[],
      palco: null, 
      seguro: null,
      ingresos:null,
      cliente: null, 
      tarifa: { id: 1, precio: 100 } as Tarifa,
      localidad: { id: 1, nombre: 'Localidad A' } as Localidad,
      personasPorTicket: 1
    };
    
    component.ticketsPage = {
      content: [ticket],
      totalElements: 1,
      totalPages: 1,
      size: 25,
      number: 0
    };
    
    mockTicketService.obtenerHijosDelPalco.and.returnValue(
      throwError(() => new Error('Error al cargar'))
    );
    
    component.onExpandRow(ticket);
    tick();
    
    expect(mockDialog.open).toHaveBeenCalled();
  }));


  it('debería obtener el texto del estado correctamente', () => {
    component.estadoActual = component.ESTADOS_TICKET.DISPONIBLE;
    expect(component.getTextoEstado()).toBe('disponible');
    
    component.estadoActual = component.ESTADOS_TICKET.VENDIDO;
    expect(component.getTextoEstado()).toBe('vendido');
    
    component.estadoActual = null;
    expect(component.getTextoEstado()).toBe('');
  });

  it('debería cambiar estado de ticket exitosamente', fakeAsync(() => {
  const ticket = cloneTicket(MOCK_TICKETS.DISPONIBLE);
  mockTicketService.editarEstadoTicket = jasmine.createSpy().and.returnValue(of({ exito: true }));
  spyOn(component, 'openMensaje');
  spyOn(component, 'cargarTickets');

  component.cambiarEstado(ticket, 1);

  tick();

  expect(mockTicketService.editarEstadoTicket).toHaveBeenCalledWith(ticket.id, 1, false);
  expect(component.openMensaje).toHaveBeenCalledWith('Estado(s) actualizado(s) correctamente');
  expect(component.cargarTickets).toHaveBeenCalled();
}));

it('debería manejar advertencia y cancelar cambio si usuario no confirma', fakeAsync(() => {
  const ticket = { id: 1, estado: 0 } as Ticket;
  
  // Mock del error 409 con la estructura que espera tu código
  const mockError = {
    status: 409,
    error: {
      advertencia: 'Conflicto con cliente',
      requiereConfirmacion: true
    }
  };
  
  // Configurar el servicio para que devuelva un error (no una respuesta exitosa)
  mockTicketService.editarEstadoTicket = jasmine.createSpy().and.returnValue(
    throwError(mockError)
  );
  
  // Mock del openMensaje que devuelve Observable<false> (usuario cancela)
  spyOn(component, 'openMensaje').and.returnValue(of(false));
  
  // Mock del método cargarTickets
  spyOn(component, 'cargarTickets').and.stub();
  
  // Ejecutar el método
  component.cambiarEstado(ticket, 1);
  tick();
  
  // Verificaciones
  expect(mockTicketService.editarEstadoTicket).toHaveBeenCalledWith(1, 1, false);
  expect(component.openMensaje).toHaveBeenCalledWith('Conflicto con cliente', true);
  expect(ticket.estado).toBe(0); // El estado debe mantenerse igual
  expect(component.cargarTickets).toHaveBeenCalled();
  expect(component.cargando).toBe(false);
}));





describe('Interacción con SearchFilter', () => {

it('debe buscar un ticket si el término es un número válido', () => {
  mockTicketService.buscarPorLocalidadYEstado.and.returnValue(of(MOCK_TICKETS.DISPONIBLE));
  
  component.searchFilters = [{ key: 'search', value: '123' }];
  fixture.detectChanges();

  const searchFilter = fixture.debugElement.query(By.css('app-search-filter')).componentInstance;

  searchFilter.onBuscar.emit({ search: '123' });

  expect(mockTicketService.buscarPorLocalidadYEstado).toHaveBeenCalledWith(123, component.localidadId, component.estadoActual);
});


  it('debe mostrar mensaje si el término no es un número', () => {
  const spyMensaje = spyOn(component, 'openMensaje').and.returnValue(of());

  component.searchFilters = [{ key: 'search', value: 'abc' }];
  fixture.detectChanges();

  const searchFilter = fixture.debugElement.query(By.css('app-search-filter')).componentInstance;
  
  // Emitimos el evento con un valor no numérico
  searchFilter.onBuscar.emit({ search: 'abc' });

  expect(spyMensaje).toHaveBeenCalledWith('Por favor ingrese un ID válido (número)');
});


  it('debe cargar todos los tickets si no se ingresa término de búsqueda', () => {
  const spyCargar = spyOn(component, 'cargarTickets');

  component.searchFilters = [{ key: 'search', value: '' }];
  fixture.detectChanges();

  const searchFilter = fixture.debugElement.query(By.css('app-search-filter')).componentInstance;

  // Emitimos el evento con valor vacío
  searchFilter.onBuscar.emit({ search: '' });

  expect(spyCargar).toHaveBeenCalled();
});

});

describe('Interacción con TableComponent', () => {

  it('debería emitir evento paginaCambiada', () => {
    component.ticketsPage = MOCK_PAGES.SINGLE_TICKET;
    fixture.detectChanges();

    const tablaDebugElement = fixture.debugElement.query(By.css('app-table'));
    expect(tablaDebugElement).not.toBeNull();

    const tablaComponentInstance = tablaDebugElement.componentInstance as MockTableComponent;
    
    spyOn(component, 'cambiarPagina');
    tablaComponentInstance.paginaCambiada.emit(2);

    expect(component.cambiarPagina).toHaveBeenCalledWith(2);
  }); 

  it('debería cargar datos correctamente en la tabla', () => {
    // Configurar datos de prueba
    component.ticketsPage = MOCK_PAGES.SINGLE_TICKET;
    fixture.detectChanges();

    const tablaDebugElement = fixture.debugElement.query(By.css('app-table'));
    expect(tablaDebugElement).not.toBeNull();

    const tablaComponentInstance = tablaDebugElement.componentInstance as MockTableComponent;

    // Verificar que los datos se pasan correctamente
    expect(tablaComponentInstance.pageData).toEqual(component.ticketsPage);
    expect(tablaComponentInstance.columnas).toEqual(['id', 'numero', 'precioTotal', 'personasPorTicket']);
    expect(tablaComponentInstance.expandableConfig).toBeDefined();
});

  it('debería manejar el evento selectedIndexChange correctamente', () => {
      // Configuración inicial
      component.ticketsPage = MOCK_PAGES.SINGLE_TICKET;
      component.ticketsPage.content = [MOCK_TICKETS.PALCO_DISPONIBLE];
      fixture.detectChanges();

      // Espía el método
      const onExpandRowSpy = spyOn(component, 'onExpandRow').and.callThrough();

      // Obtener instancia del mock TableComponent
      const tablaDebugElement = fixture.debugElement.query(By.css('app-table'));
      expect(tablaDebugElement).not.toBeNull();
      const tablaComponentInstance = tablaDebugElement.componentInstance as MockTableComponent;

      // Simular emisión del evento selectedIndexChange con índice 0
      tablaComponentInstance.selectedIndexChange.emit(0); // Emitir el índice, no el objeto
      
      fixture.detectChanges();

      // Verificar que el método fue llamado con el ticket correcto
      expect(onExpandRowSpy).toHaveBeenCalled();
      expect(onExpandRowSpy).toHaveBeenCalledWith(MOCK_TICKETS.PALCO_DISPONIBLE);
  });

  it('debería mostrar loading cuando cargando es true', () => {
    component.cargando = true;
    fixture.detectChanges();

    const tablaDebugElement = fixture.debugElement.query(By.css('app-table'));
    expect(tablaDebugElement).not.toBeNull();

    const tablaComponentInstance = tablaDebugElement.componentInstance as MockTableComponent;

    // Verificar que se pasa el estado de carga
    expect(tablaComponentInstance.cargando).toBeTrue();
  });


  it('debería mostrar botones de acción según el estado del ticket', () => {
    // Configurar datos con diferentes estados
    component.ticketsPage = {
      content: [
        MOCK_TICKETS.DISPONIBLE,
        MOCK_TICKETS.VENDIDO,
        MOCK_TICKETS.PALCO_DISPONIBLE
      ],
      totalElements: 3,
      totalPages: 1,
      size: 25,
      number: 0
    };
    fixture.detectChanges();

    const tablaDebugElement = fixture.debugElement.query(By.css('app-table'));
    expect(tablaDebugElement).not.toBeNull();

    const tablaComponentInstance = tablaDebugElement.componentInstance as MockTableComponent;

    // Verificar que las acciones se configuran correctamente
    expect(tablaComponentInstance.expandableConfig).toBeDefined();
  });
});

});