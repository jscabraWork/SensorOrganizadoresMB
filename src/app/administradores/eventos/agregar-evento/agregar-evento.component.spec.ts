import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { AgregarEventoComponent } from './agregar-evento.component';
import { EventoDataService } from '../../../service/data/evento-data.service';
import { TipoDataService } from '../../../service/data/tipo-data.service';
import { CiudadDataService } from '../../../service/data/ciudad-data.service';
import { TemporadaDataService } from '../../../service/data/temporada-data.service';
import { OrganizadorDataService } from '../../../service/data/organizador-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { VenueDataService } from '../../../service/data/venue-data.service';

const mockRouter = { navigate: jasmine.createSpy('navigate') };
const mockActivatedRoute = {
  paramMap: of(new Map([['idTemporada', '1']])),
  parent: {
    paramMap: of(new Map([['nombre', 'adminName']]))
  }
};

const mockEventoService = {
  getPorId: jasmine.createSpy('getPorId').and.returnValue(of({ tipo: null, venues: [], organizadores: [] })),
  editarEvento: jasmine.createSpy('editarEvento').and.returnValue(of({})),
  crear: jasmine.createSpy('crear').and.returnValue(of({}))
};

const mockTipoService = {
  listar: jasmine.createSpy('listar').and.returnValue(of([]))
};

const mockCiudadService = {
  listar: jasmine.createSpy('listar').and.returnValue(of([]))
};

const mockTemporadaService = {
  getPorId: jasmine.createSpy('getPorId').and.returnValue(of({}))
};

const mockOrganizadorService = {
  getOrganizadores: jasmine.createSpy('getOrganizadores').and.returnValue(of([]))
};

const mockDialog = {
  open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
};

const mockVenueService = {
  listarVenuesByCiudadId: jasmine.createSpy('listarVenuesByCiudadId').and.returnValue(of([]))
};

const mockCiudad = {
  id: 1,
  nombre: 'Ciudad de prueba',
  venues: [{
    id: 1,
    nombre: 'Venue prueba',
    urlMapa: 'https://mapa.url',
    ciudad: null, 
    eventos: []
  }]
};

const mockVenue = {
  id: 1,
  nombre: 'Venue de prueba',
  urlMapa: 'https://maps.example.com/venue1',
  ciudad: null,
  eventos: []
};

const mockOrg = {
  numeroDocumento: '123',
  usuario: 'organizadorUser',
  nombre: 'Organizador Prueba',
  correo: 'org@correo.com',
  celular: '3001234567',
  tipoDocumento: 1,
  eventos: []
};

describe('AgregarEventoComponent', () => {
  let component: AgregarEventoComponent;
  let fixture: ComponentFixture<AgregarEventoComponent>;

 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarEventoComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: EventoDataService, useValue: mockEventoService },
        { provide: TipoDataService, useValue: mockTipoService },
        { provide: CiudadDataService, useValue: mockCiudadService },
        { provide: TemporadaDataService, useValue: mockTemporadaService },
        { provide: OrganizadorDataService, useValue: mockOrganizadorService },
        { provide: VenueDataService, useValue: mockVenueService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarEventoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar tipos, ciudades y organizadores en ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(mockTipoService.listar).toHaveBeenCalled();
    expect(mockCiudadService.listar).toHaveBeenCalled();
    expect(mockOrganizadorService.getOrganizadores).toHaveBeenCalled();
    expect(mockTemporadaService.getPorId).toHaveBeenCalledWith(1);
  }));

  it('debería mostrar mensaje de error si falla cargarOrganizadores', fakeAsync(() => {
    mockOrganizadorService.getOrganizadores.and.returnValue(throwError(() => new Error('Error')));

    component.cargarOrganizadores().catch(() => {
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalled();
    });
  }));

  it('debería agregar un organizador a la lista', () => {
    component.organizadorAgregar = mockOrg;
    component.agregarALista();

    expect(component.organizadoresEvento).toContain(mockOrg);
    expect(component.evento.organizadores).toContain(mockOrg);
  });

  it('debería quitar un organizador de la lista', () => {
    component.organizadoresEvento = [mockOrg];
    component.evento.organizadores = [mockOrg];

    component.quitarLista(0);

    expect(component.organizadoresEvento.length).toBe(0);
    expect(component.evento.organizadores.length).toBe(0);
  });

  it('debería navegar a crear tipo evento', () => {
    component.nombre = 'admin';
    component.idTemporada = 2;
    component.crearTipoEvento();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('debería actualizar evento si está en modo edición', () => {
    component.modoEdicion = true;
    component.temporada = {} as any;
    component.evento = { nombre: 'Evento', tipo: {}, venues: [{}], organizadores: [] } as any;
    spyOn(component, 'validarFormulario').and.returnValue(true);

    component.crearEvento();
    expect(mockEventoService.editarEvento).toHaveBeenCalled();
  });

  it('debería crear nuevo evento si no está en modo edición', () => {
    component.modoEdicion = false;
    component.temporada = {} as any;
    component.evento = { nombre: 'Evento', tipo: {}, venues: [{}], organizadores: [] } as any;
    spyOn(component, 'validarFormulario').and.returnValue(true);

    component.crearEvento();
    expect(mockEventoService.crear).toHaveBeenCalled();
  });

  it('no debería crear o actualizar si el formulario no es válido', () => {
    spyOn(component, 'validarFormulario').and.returnValue(false);
    spyOn(component, 'actualizarEvento');
    spyOn(component, 'crearNuevoEvento');
    
    component.modoEdicion = false;
    component.crearEvento();
    
    expect(component.crearNuevoEvento).not.toHaveBeenCalled();
    expect(component.actualizarEvento).not.toHaveBeenCalled();
  });

  describe('Métodos relacionados con ciudades y venues', () => {
    it('debería cargar ciudades correctamente', fakeAsync(() => {
      mockCiudadService.listar.and.returnValue(of([mockCiudad]));
      component.cargarCiudades();
      tick();
      
      expect(component.ciudades).toContain(mockCiudad);
      expect(component.loading).toBeFalse();
    }));
  
    it('debería manejar error al cargar ciudades', fakeAsync(() => {
      mockCiudadService.listar.and.returnValue(throwError(() => new Error('Error')));
      component.cargarCiudades().catch(() => {
        expect(component.loading).toBeFalse();
        expect(mockDialog.open).toHaveBeenCalled();
      });
      tick();
    }));
  
    it('debería cargar venues al cambiar ciudad', fakeAsync(() => {
      mockVenueService.listarVenuesByCiudadId.and.returnValue(of([mockVenue]));
      
      component.onCiudadChange(1);
      tick();
      
      expect(mockVenueService.listarVenuesByCiudadId).toHaveBeenCalledWith(1);
      expect(component.venuesDeCiudadSeleccionada).toContain(mockVenue);
      expect(component.loading).toBeFalse();
      expect(component.venueSeleccionadoId).toBeNull();
      expect(component.evento.venue).toEqual(null);
    }));
  
    it('debería manejar error al cargar venues', fakeAsync(() => {
      mockVenueService.listarVenuesByCiudadId.and.returnValue(throwError(() => new Error('Error')));
      
      component.onCiudadChange(1);
      tick();
      
      expect(component.venuesDeCiudadSeleccionada).toEqual([]);
      expect(component.loading).toBeFalse();
      expect(mockDialog.open).toHaveBeenCalled();
    }));
  
    it('debería limpiar venues cuando ciudadId es null', () => {
      component.onCiudadChange(null);
      expect(component.venuesDeCiudadSeleccionada).toEqual([]);
    });
  
    it('debería seleccionar venue correctamente', () => {
      component.venuesDeCiudadSeleccionada = [mockVenue];
      component.onVenueChange(1);
      
      expect(component.evento.venue).toEqual(mockVenue);
    });
  
    it('no debería hacer nada si venueId es inválido', () => {
      component.onVenueChange(null);
      expect(component.evento.venue).toBeUndefined();
    });
  });
  
  describe('Validación de formulario', () => {
    it('debería validar formulario correctamente', () => {
      component.evento.nombre = 'Evento prueba';
      component.evento.tipo = { id: 1, nombre: 'Tipo' };
      component.ciudadSeleccionadaId = 1;
      component.evento.venue = mockVenue;
      
      expect(component.validarFormulario()).toBeTrue();
    });
  
    it('debería detectar formulario inválido', () => {
      // Todos los campos requeridos están vacíos
      expect(component.validarFormulario()).toBeFalse();
      
      // Solo nombre lleno
      component.evento.nombre = 'Evento prueba';
      expect(component.validarFormulario()).toBeFalse();
      
      // Nombre y tipo llenos
      component.evento.tipo = { id: 1, nombre: 'Tipo' };
      expect(component.validarFormulario()).toBeFalse();
      
      // Nombre, tipo y ciudad llenos
      component.ciudadSeleccionadaId = 1;
      expect(component.validarFormulario()).toBeFalse();
      
      // Solo falta venues
      component.evento.venue = null;
      expect(component.validarFormulario()).toBeFalse();
    });
  });


});
