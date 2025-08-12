import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsuarioDataService } from './usuario-data.service';
import { API_URL_USUARIOS } from '../../app.constants';
import { Usuario } from '../../models/usuario.model';
import { Page } from '../../models/page.mode';

describe('UsuarioDataService', () => {
  let service: UsuarioDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsuarioDataService]
    });
    service = TestBed.inject(UsuarioDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener usuarios paginados por rol', () => {
    const pagina = 1;
    const roleId = 3;
    const respuestaEsperada: Page<Usuario> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10
    };


    service.getUsuariosPaginados(pagina, roleId).subscribe(respuesta => {
      expect(respuesta).toEqual(respuestaEsperada);
    });

    const req = httpMock.expectOne(`${API_URL_USUARIOS}/role/${roleId}/${pagina}`);
    expect(req.request.method).toBe('GET');
    req.flush(respuestaEsperada);
  });

  it('debería obtener cliente por ID', () => {
    const usuarioMock = { id: '123', nombre: 'Cliente Test' };

    service.getClientePorId('123').subscribe(usuario => {
      expect(usuario).toEqual(usuarioMock);
    });

    const req = httpMock.expectOne(`${API_URL_USUARIOS}/123`);
    expect(req.request.method).toBe('GET');
    req.flush(usuarioMock);
  });

  it('debería buscar usuario por documento y rol', () => {
    const roleId = 2;
    const documento = '123456';
    const usuarioEsperado: Usuario = {
      nombre: 'Usuario Documento',
      numeroDocumento: '123456',
      tipoDocumento: { id: 1, nombre: 'CC' },
      correo: 'docu@test.com',
      contrasena: 'pass123',
      celular: '3001234567',
      enabled: true,
      roles: [],
      simplificado: false
    };

    service.buscarUsuarioPorDocumento(roleId, documento).subscribe(usuario => {
      expect(usuario).toEqual(usuarioEsperado);
    });

    const req = httpMock.expectOne(`${API_URL_USUARIOS}/cliente/documento/${documento}`);
    expect(req.request.method).toBe('GET');
    req.flush(usuarioEsperado);
  });


  it('debería buscar usuario por correo', () => {
    const correo = 'correo@test.com';
    const usuarioEsperado: Usuario = {
      nombre: 'Correo Test',
      numeroDocumento: '987654',
      tipoDocumento: { id: 1, nombre: 'TI' },
      correo,
      contrasena: 'pass567',
      celular: '3012345678',
      enabled: true,
      roles: [],
      simplificado: false
    };

    service.buscarPorCorreo(correo).subscribe(usuario => {
      expect(usuario).toEqual(usuarioEsperado);
    });

    const req = httpMock.expectOne(`${API_URL_USUARIOS}/correo/${correo}`);
    expect(req.request.method).toBe('GET');
    req.flush(usuarioEsperado);
  });


  it('debería crear un usuario con roles', () => {
    const nuevoUsuario: Usuario = { nombre: 'Nuevo Usuario' } as Usuario;

    service.crearUsuarioConRoles(nuevoUsuario).subscribe(respuesta => {
      expect(respuesta).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(`${API_URL_USUARIOS}/crear/usuario`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevoUsuario);
    req.flush({ ok: true });
  });

  it('debería actualizar un usuario con roles', () => {
    const usuarioActualizado: Usuario = { nombre: 'Usuario Actualizado' } as Usuario;

    service.actualizarUsuarioConRoles(usuarioActualizado).subscribe(respuesta => {
      expect(respuesta).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${API_URL_USUARIOS}/actualizar/usuario`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(usuarioActualizado);
    req.flush({ success: true });
  });

  it('debería cambiar el estado "enabled" de un usuario', () => {
    const numeroDocumento = '123456';
    const respuestaEsperada = { enabled: false };

    service.cambiarEstadoEnabled(numeroDocumento).subscribe(respuesta => {
      expect(respuesta).toEqual(respuestaEsperada);
    });

    const req = httpMock.expectOne(`${API_URL_USUARIOS}/enabled/${numeroDocumento}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBeNull();
    req.flush(respuestaEsperada);
  });
});
