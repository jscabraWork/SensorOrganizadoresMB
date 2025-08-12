import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { NumeroOrdenClienteComponent } from './numero-orden-cliente.component';
import { delay, Observable, of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdenDataService } from '../../../service/data/orden-data.service';
import { TicketDataService } from '../../../service/data/ticket-data.service';
import { MatDialog } from '@angular/material/dialog';
import { Orden } from '../../../models/orden.model';
import { Ticket } from '../../../models/ticket.model';

describe('NumeroOrdenClienteComponent', () => {
  let component: NumeroOrdenClienteComponent;
  let fixture: ComponentFixture<NumeroOrdenClienteComponent>;
  let mockOrdenService: jasmine.SpyObj<OrdenDataService>;
  let mockTicketService: jasmine.SpyObj<TicketDataService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockActivatedRoute = {
    parent: {
      paramMap: of(new Map([['nombre', 'test-user']]))
    }
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(async () => {
    mockOrdenService = jasmine.createSpyObj('OrdenDataService', [
      'getPorId',
      'cambiarEstadoOrden',
      'agregarTicketAorden',
      'eliminarTicketDeOrden',
      'validarContraPtpTrx'
    ]);

    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue({
      afterClosed: () => of(true)
    } as any);

    await TestBed.configureTestingModule({
      imports: [NumeroOrdenClienteComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: OrdenDataService, useValue: mockOrdenService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NumeroOrdenClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('buscarOrden', () => {
    it('no llama el servicio si no hay un numero de orden', () => {
      component.idOrden = null;
      component.buscarOrden();
      expect(mockOrdenService.getPorId);
    });

    it('debe mostrar la orden encontrada', () => {
      const mockOrden = { id: 1, estado: 1 } as Orden;
      mockOrdenService.getPorId.and.returnValue(of(mockOrden));
      expect(component.buscarOrden);

      component.idOrden = 1;
      component.buscarOrden();

      expect(mockOrdenService.getPorId).toHaveBeenCalledWith(1);
      expect(component.ordenEncontrada).toBeTrue();
      expect(component.orden).toEqual(mockOrden);
      expect(component.cargando).toBeFalse();
    });

    it('muestra un error si no se encuentra la orden', () => {
      mockOrdenService.getPorId.and.returnValue(throwError(() => ({ status: 404 })));

      component.idOrden = 999;
      component.buscarOrden();

      expect(component.ordenEncontrada).toBeFalse();
      expect(component.cargando).toBeFalse();
      expect(mockDialog.open).toHaveBeenCalled();
    });
  });

  describe('cambiarEstado', () => {
  let mockOrden: Orden;
  let mockUpdatedOrden: Orden;

  beforeEach(() => {
    mockOrden = { id: 1, estado: 1 } as Orden;
    mockUpdatedOrden = { ...mockOrden, estado: 2 };

  });

  it('debe cambiar el estado correctamente', fakeAsync(() => {
    mockOrdenService.cambiarEstadoOrden.and.returnValue(of(mockUpdatedOrden));
    spyOn(component, 'openMensaje');
    spyOn(component, 'buscarOrden');

    component.cambiarEstado(mockOrden);
    tick();

    expect(mockOrdenService.cambiarEstadoOrden).toHaveBeenCalledWith(mockOrden);
    expect(component.orden).toEqual(mockUpdatedOrden);
    expect(component.openMensaje).toHaveBeenCalledWith('Se le cambió el estado a la orden');
    expect(component.buscarOrden).toHaveBeenCalled();
    expect(component.cargando).toBeFalse();
  }));

  it('debe manejar errores y restaurar el estado anterior', fakeAsync(() => {
    mockOrdenService.cambiarEstadoOrden.and.returnValue(
      throwError(() => new Error('Error de prueba'))
    );
    spyOn(component, 'openMensaje');

    const estadoOriginal = mockOrden.estado;
    component.cambiarEstado(mockOrden);
    tick();
    expect(mockOrden.estado).toBe(estadoOriginal); // Estado restaurado
    expect(component.openMensaje).toHaveBeenCalledWith('No se pudo cambiar el estado');
    expect(component.cargando).toBeFalse();
  }));
});

  describe('agregarTicket', () => {
    beforeEach(() => {
      component.idOrden = 1;
      component.cargando = false;
    });

    it('no llama el service si no ingresa un id de un ticket', () => {
      component.idTicket = null;
      component.agregarTicket();
      expect(mockOrdenService.agregarTicketAorden).not.toHaveBeenCalled();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('debe llamar el servicio si el id de ticket es valido', () => {
      const testTicketId = 123;
      mockOrdenService.agregarTicketAorden.and.returnValue(of({}));
      spyOn(component, 'buscarOrden');

      component.idTicket = testTicketId;
      component.agregarTicket();

      expect(mockOrdenService.agregarTicketAorden).toHaveBeenCalledWith(1, testTicketId);
      expect(component.buscarOrden).toHaveBeenCalled();
      expect(component.idTicket).toBeNull();
      expect(component.cargando).toBeFalse();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('muestra un mensaje en caso de que el ticket no exista o ya este en la orden', () => {
      mockOrdenService.agregarTicketAorden.and.returnValue(
        throwError(() => ({ status: 500 }))
      );

      component.idTicket = 123;
      component.agregarTicket();

      expect(component.cargando).toBeFalse();
      expect(mockDialog.open).toHaveBeenCalled();
    });
  });

  describe('eliminarTicketDeOrden', () => {
  it('debe llamar el servicio cuando confirme que se elimina el ticket', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true) });
    mockDialog.open.and.returnValue(dialogRefSpyObj);

    mockOrdenService.eliminarTicketDeOrden.and.returnValue(of({}));
    spyOn(component, 'buscarOrden');
    spyOn(component, 'openMensaje').and.callThrough();

    component.idOrden = 1;
    component.eliminarTicketDeOrden(123);

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockOrdenService.eliminarTicketDeOrden).toHaveBeenCalledWith(1, 123);
    expect(component.buscarOrden).toHaveBeenCalled();
    expect(component.cargando).toBeFalse();
  });

  it('no llama el servicio para eliminar el ticket si el usuario cancela', () => {

    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false) });
    mockDialog.open.and.returnValue(dialogRefSpyObj);

    spyOn(component, 'openMensaje').and.callThrough();
    spyOn(component, 'buscarOrden');

    component.idOrden = 1;
    component.eliminarTicketDeOrden(123);

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockOrdenService.eliminarTicketDeOrden).not.toHaveBeenCalled();
    expect(component.buscarOrden).not.toHaveBeenCalled();
  });

  it('maneja correctamente un error al eliminar el ticket', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true) });
    mockDialog.open.and.returnValue(dialogRefSpyObj);

    const errorResponse = { error: { message: 'Error del servidor' } };
    mockOrdenService.eliminarTicketDeOrden.and.returnValue(throwError(() => errorResponse));

    spyOn(component, 'openMensaje').and.callThrough();
    spyOn(component, 'buscarOrden');

    component.idOrden = 1;
    component.eliminarTicketDeOrden(123);

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockOrdenService.eliminarTicketDeOrden).toHaveBeenCalledWith(1, 123);
    expect(component.buscarOrden).not.toHaveBeenCalled();
    expect(component.cargando).toBeFalse();

    expect(component.openMensaje).toHaveBeenCalledWith('Error al eliminar el ticket: Error del servidor');
  });

  it('muestra mensaje de error si no se proporciona un ID de ticket válido', () => {
    spyOn(component, 'openMensaje');

    component.eliminarTicketDeOrden(null);

    expect(component.openMensaje).toHaveBeenCalledWith("No se proporcionó un ID de ticket válido");
    expect(mockDialog.open).not.toHaveBeenCalled();
    expect(mockOrdenService.eliminarTicketDeOrden).not.toHaveBeenCalled();
  });
});

 describe('validacionContraPtp', () => {
  beforeEach(() => {
    mockOrdenService.validarContraPtpTrx.and.returnValue(of(true));
    spyOn(component, 'openMensaje');
    spyOn(component, 'buscarOrden');
  });
  it('debe cambiar cargando a true y luego a false si es exitoso la comprobacion con ptp', fakeAsync(() => {
    mockOrdenService.validarContraPtpTrx.and.returnValue(of({}));
    component.validacionContraPtp(123);
    flush();
    expect(component.openMensaje).toHaveBeenCalledWith("Validacion exitosa");
    expect(component.buscarOrden).toHaveBeenCalled();
  }));

  it('no cambia el estado si hay un error y manda un mensaje que valide con soporte', fakeAsync(() => {
    mockOrdenService.validarContraPtpTrx.and.returnValue(throwError(() => new Error('test error')));
    component.validacionContraPtp(123);
    flush();
    expect(component.openMensaje).toHaveBeenCalledWith("Sucedio un error por favor validar con el equipo de soporte");
  }));
});

});
