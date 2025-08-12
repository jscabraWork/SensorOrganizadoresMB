import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { UsuariosActivosInactivosComponent } from './usuarios-activos-inactivos.component';
import { UsuarioDataService } from '../../../service/data/usuario-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HardcodedAutheticationService } from '../../../service/hardcoded-authetication.service';
import { of, throwError } from 'rxjs';

describe('UsuariosActivosInactivosComponent', () => {
  let component: UsuariosActivosInactivosComponent;
  let fixture: ComponentFixture<UsuariosActivosInactivosComponent>;

  const usuarioEjemplo = {
    enabled: true,
    numeroDocumento: '123',
    nombre: 'Test',
    correo: 'test@mail.com',
    celular: '123'
  };

  const mockUsuarioService = {
    getUsuariosPaginados: jasmine.createSpy('getUsuariosPaginados').and.returnValue(of({
      usuarios: {
        content: [usuarioEjemplo],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 25,
        first: true,
        last: true
      }
    })),
    buscarPorCorreo: jasmine.createSpy('buscarPorCorreo').and.returnValue(of(usuarioEjemplo)),
    buscarUsuarioPorDocumento: jasmine.createSpy('buscarUsuarioPorDocumento').and.returnValue(of(usuarioEjemplo)),
    cambiarEstadoEnabled: jasmine.createSpy('cambiarEstadoEnabled').and.returnValue(of({}))
  };


  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  mockRouter.url = '/administradores/admin/admin123/clientes';

  const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
  const mockDialogRef = { afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(true)) };
  mockDialog.open.and.returnValue(mockDialogRef);

  const mockActivatedRoute = {
    url: of([{ path: 'clientes' }])
  };

  const mockAuth = {
    getAdmin: jasmine.createSpy('getAdmin').and.returnValue('admin123')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosActivosInactivosComponent],
      providers: [
        { provide: UsuarioDataService, useValue: mockUsuarioService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog },
        { provide: HardcodedAutheticationService, useValue: mockAuth }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosActivosInactivosComponent);
    component = fixture.componentInstance;
    spyOn(component, 'openMensaje').and.returnValue(of(true));
    fixture.detectChanges();
  });

  it('debe cargar usuarios correctamente', fakeAsync(() => {
    component.roleId = 2;
    component.paginaActual = 0;
    component.cargarUsuarios();
    tick();
    expect(mockUsuarioService.getUsuariosPaginados).toHaveBeenCalledWith(0, 2);
    expect(component.usuariosPage.content.length).toBeGreaterThan(0);
    expect(component.cargando).toBeFalse();
  }));

  it('debe manejar error al cargar usuarios', fakeAsync(() => {
    mockUsuarioService.getUsuariosPaginados.and.returnValue(throwError(() => new Error('Error')));
    component.cargarUsuarios();
    tick();
    expect(component.usuariosPage.content).toEqual([]);
    expect(component.cargando).toBeFalse();
  }));


  it('debe buscar usuario por correo correctamente', fakeAsync(() => {
    mockUsuarioService.buscarPorCorreo.and.returnValue(of(usuarioEjemplo)); // <--- Importante
    component.buscarPorCorreo('test@mail.com');
    tick();
    expect(mockUsuarioService.buscarPorCorreo).toHaveBeenCalledWith('test@mail.com');
    expect(component.usuariosPage.content.length).toBe(1);
    expect(component.cargando).toBeFalse();
  }));


  it('debe mostrar mensaje si no encuentra usuario por correo', fakeAsync(() => {
    mockUsuarioService.buscarPorCorreo.and.returnValue(of({}));
    component.buscarPorCorreo('noexiste@mail.com');
    tick();
    expect(component.openMensaje).toHaveBeenCalledWith('No se encontró ningún usuario con el correo: noexiste@mail.com');
    expect(component.cargando).toBeFalse();
  }));

  it('debe manejar error en búsqueda por correo', fakeAsync(() => {
    mockUsuarioService.buscarPorCorreo.and.returnValue(throwError(() => new Error('Error')));
    component.buscarPorCorreo('error@mail.com');
    tick();
    expect(component.openMensaje).toHaveBeenCalledWith('No se encontró ningún usuario con el correo: error@mail.com');
    expect(component.cargando).toBeFalse();
  }));

  it('debe buscar usuario por documento correctamente', fakeAsync(() => {
    // Configurar mock para devolver un usuario válido
    mockUsuarioService.buscarUsuarioPorDocumento.and.returnValue(of({
      ...usuarioEjemplo,
      estado: usuarioEjemplo.enabled ? 'Activo' : 'Inactivo'
    }));

    component.buscarPorDocumento('123');
    tick();

    // Verificar que se creó la página correctamente
    expect(component.usuariosPage).toBeTruthy();
    expect(component.usuariosPage.content.length).toBe(1);
    expect(component.usuariosPage.content[0].numeroDocumento).toBe('123');
    expect(component.cargando).toBeFalse();
  }));

  it('debe mostrar mensaje si no encuentra usuario por documento', fakeAsync(() => {
    mockUsuarioService.buscarUsuarioPorDocumento.and.returnValue(of({}));
    component.roleId = 2;
    component.buscarPorDocumento('000');
    tick();
    expect(component.openMensaje).toHaveBeenCalledWith('No se encontró ningún usuario con el documento: 000');
    expect(component.cargando).toBeFalse();
  }));

  it('debe manejar error en búsqueda por documento', fakeAsync(() => {
    mockUsuarioService.buscarUsuarioPorDocumento.and.returnValue(throwError(() => new Error('Error')));
    component.roleId = 2;
    component.buscarPorDocumento('error');
    tick();
    expect(component.openMensaje).toHaveBeenCalledWith('No se encontró ningún usuario con el documento: error');
    expect(component.cargando).toBeFalse();
  }));

  it('debe manejar error al cambiar estado del usuario', fakeAsync(() => {
    mockUsuarioService.cambiarEstadoEnabled.and.returnValue(throwError(() => new Error('Error')));
    const usuario = { numeroDocumento: '123' } as any;
    component.cambiarEstadoUsuario(usuario);
    tick();
    expect(component.openMensaje).toHaveBeenCalledWith('Ocurrió un error al cambiar el estado del usuario.');
    expect(component.cargando).toBeFalse();
  }));


})