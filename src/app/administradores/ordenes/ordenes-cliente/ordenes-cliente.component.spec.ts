import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdenesClienteComponent } from './ordenes-cliente.component';
import { OrdenDataService } from '../../../service/data/orden-data.service';
import { MatDialog } from '@angular/material/dialog';
import { Orden } from '../../../models/orden.model';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('OrdenesClienteComponent', () => {
  let component: OrdenesClienteComponent;
  let fixture: ComponentFixture<OrdenesClienteComponent>;
  let mockOrdenService: jasmine.SpyObj<OrdenDataService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockActivatedRoute: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockOrdenService = jasmine.createSpyObj('OrdenDataService', ['ordenesPorClienteId']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockActivatedRoute = {
      // Agrega aquí cualquier propiedad o método que uses de ActivatedRoute
    };
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        OrdenesClienteComponent,
        RouterTestingModule // Importa RouterTestingModule
      ],
      providers: [
        { provide: OrdenDataService, useValue: mockOrdenService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdenesClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('buscarOrdenesPorClienteId', () => {
    it('no debe llamar al servicio si no hay clienteId y debe mostrar mensaje', () => {
      component.clienteId = null;
      spyOn(component, 'openMensaje');

      component.buscarOrdenesPorClienteId();

      expect(component.openMensaje).toHaveBeenCalledWith('Por favor ingresa el numero de documento del cliente');
      expect(mockOrdenService.ordenesPorClienteId).not.toHaveBeenCalled();
    });

    it('debe cargar las ordenes cuando el servicio retorna datos', () => {
      const mockResponse = { ordenes: [{ id: 1, estado: 1 }, { id: 2, estado: 2 }] as Orden[] };
      mockOrdenService.ordenesPorClienteId.and.returnValue(of(mockResponse));
      component.clienteId = "123";

      component.buscarOrdenesPorClienteId();

      expect(mockOrdenService.ordenesPorClienteId).toHaveBeenCalledWith("123");
      expect(component.ordenesEncontradas).toBeTrue();
      expect(component.ordenes).toEqual(mockResponse.ordenes);
      expect(component.cargando).toBeFalse();
    });

    it('muestra un mensaje de error si hay algun problema llamando al servicio', () => {
      mockOrdenService.ordenesPorClienteId.and.returnValue(throwError(() => ({ status: 404 })));
      component.clienteId = "999";
      spyOn(component, 'openMensaje');

      component.buscarOrdenesPorClienteId();

      expect(component.ordenesEncontradas).toBeFalse();
      expect(component.cargando).toBeFalse();
      expect(component.openMensaje).toHaveBeenCalledWith('No se encontraron las ordenes de ese cliente');
    });

    it('debe manejar otros errores mostrando mensaje', () => {
      mockOrdenService.ordenesPorClienteId.and.returnValue(throwError(() => ({ status: 500 })));
      component.clienteId = "456";
      spyOn(component, 'openMensaje');

      component.buscarOrdenesPorClienteId();

      expect(component.cargando).toBeFalse();
      expect(component.openMensaje).toHaveBeenCalledWith('No se encontraron las ordenes de ese cliente');
    });
  });
});
