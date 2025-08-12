import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { VenueDataService } from '../../service/data/venue-data.service';
import { MensajeComponent } from '../../mensaje/mensaje.component';
import { VenuesComponent } from './venues.component';
import { CiudadDataService } from '../../service/data/ciudad-data.service';

describe('VenuesComponent', () => {
  let component: VenuesComponent;
  let fixture: ComponentFixture<VenuesComponent>;
  let mockVenueService: any;
  let mockCiudadService: any;
  let mockRouter: any;
  let mockDialog: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockVenueService = {
      listarVenuesByCiudadId: jasmine.createSpy('listarVenuesByCiudadId').and.returnValue(of([
        { id: 1, nombre: 'Venue1', urlMapa: "http://google.com" },
        { id: 2, nombre: 'Venue2', urlMapa: "http://google145.com" },
      ])),
      getPorId: jasmine.createSpy().and.returnValue(of({
        id: 1,
        nombre: 'Venue1',
        urlMapa: "http://google.com",
        eventos: []
      })),
      delete: jasmine.createSpy().and.returnValue(of({}))
    };

    mockCiudadService = {
      getPorId: jasmine.createSpy().and.returnValue(of({ nombre: 'Ciudad-Test' }))
    };

    mockRouter = {
      navigate: jasmine.createSpy()
    };

    mockDialog = {
      open: jasmine.createSpy().and.returnValue({
        afterClosed: () => of(true)
      })
    };

    mockActivatedRoute = {
      parent: {
        paramMap: of(new Map([
          ['idCiudad', '123'],
          ['nombre', 'test-admin']
        ])),
        snapshot: {
          paramMap: new Map([
            ['idCiudad', '123'],
            ['nombre', 'test-admin']
          ])
        }
      },
      paramMap: of(new Map([['idCiudad', '123']])),
      snapshot: {}
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, VenuesComponent],
      providers: [
        { provide: VenueDataService, useValue: mockVenueService },
        { provide: CiudadDataService, useValue: mockCiudadService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VenuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar venues al iniciar', () => {
    expect(mockVenueService.listarVenuesByCiudadId).toHaveBeenCalledWith(123);
    expect(component.venues.length).toBe(2);
  });


  it('debería limpiar venues y desactivar carga en error', () => {
    mockVenueService.listarVenuesByCiudadId.and.returnValue(throwError(() => new Error('Error')));
    component.cargarVenues();
    expect(component.venues).toEqual([]);
    expect(component.cargando).toBeFalse();
  });

  it('debería cargar ciudadNombre al iniciar', () => {
    expect(mockCiudadService.getPorId).toHaveBeenCalledWith(123);
    expect(component.ciudadNombre).toBe('Ciudad-Test');
  });

  it('muestra un mensaje con el error si hay un problema al cargar ciudad', fakeAsync(() => {
    component.ciudadNombre = 'Valor previo';

    mockCiudadService.getPorId.and.returnValue(
      throwError(() => new Error('Simulated Error'))
    );

    spyOn(console, 'error');
    component.getCiudadPorId();
    tick();

    expect(component.ciudadNombre).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      'Error cargando ciudad',
      jasmine.any(Error)
    );
  }));

  it('debería eliminar venue si no tiene eventos', () => {
    spyOn(component, 'openMensaje').and.returnValue(of(true));
    mockVenueService.getPorId.and.returnValue(of({ id: 1, eventos: [] }));
    mockVenueService.delete.and.returnValue(of(null));
    component.eliminarVenue(1);
    expect(mockVenueService.delete).toHaveBeenCalledWith(1);
});

it('debería no eliminar venue si tiene eventos', () => {
    spyOn(component, 'openMensaje').and.callFake((mensaje, esConfirmacion) => {
        if (esConfirmacion) return of(true);
        return of();
    });
    mockVenueService.getPorId.and.returnValue(of({
        id: 1,
        eventos: [{ id: 1 }]
    }));
    component.eliminarVenue(1);
    expect(mockVenueService.delete).not.toHaveBeenCalled();
    expect(component.openMensaje).toHaveBeenCalledWith("No se puede eliminar el venue porque tiene eventos asociados.");
});

  it('debería navegar a editar Venue', () => {
    const venue = { id: 1, nombre: 'Venue1', urlMapa: "http://google.com", eventos: [],ciudad:null };
    component.editarVenue(venue);
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/administradores/admin', 'test-admin', 'ciudad', 123, 'venues', 'editar', 1]
    );
  });

  it('debería navegar a agregar venue', () => {
    component.navigateToAgregarVenue();
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['../venues/agregar'],
      { relativeTo: mockActivatedRoute }
    );
  });
});
