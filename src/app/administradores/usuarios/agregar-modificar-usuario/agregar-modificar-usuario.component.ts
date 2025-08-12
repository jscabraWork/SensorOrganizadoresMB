import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../../models/usuario.model';
import { Role } from '../../../models/rol.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioDataService } from '../../../service/data/usuario-data.service';
import { MatDialog } from '@angular/material/dialog';
import { RoleDataService } from '../../../service/data/role-data.service';
import { TipoDocumentoDataService } from '../../../service/data/tipo-documento-data.service';
import { TipoDocumento } from '../../../models/tipo-documento.model';
import { MensajeComponent } from '../../../mensaje/mensaje.component';
import { Observable } from 'rxjs';
import { StorageService } from '../../../service/data/storage.service';
import { HardcodedAutheticationService } from '../../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-agregar-modificar-usuario',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './agregar-modificar-usuario.component.html',
  styleUrl: './agregar-modificar-usuario.component.scss'
})
export class AgregarModificarUsuarioComponent {

  usuario: Usuario
  usuarioId: string
  formEnviado = false
  loading = false
  modoEdicion = false
  nombre: string
  rolAgregar: Role | null = null
  tiposDocumento: TipoDocumento[] = []
  roles: Role[] = []
  rolesUsuario: Role[] = []
  rolRepetido = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usuarioService: UsuarioDataService,
    private roleService: RoleDataService,
    private tipoDocumentoService: TipoDocumentoDataService,
    private storageService: StorageService,
    private autenticado: HardcodedAutheticationService,
    private dialog: MatDialog
  ) {
    this.usuario = new Usuario()
    this.usuario.tipoDocumento = null;
  }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin()

    const estadoGuardado = this.storageService.obtenerDatosUsuario?.();
    if (estadoGuardado) {
      this.usuario = estadoGuardado.usuario;
      this.rolesUsuario = estadoGuardado.rolesUsuario;
      // Limpia el storage para que no se reutilice accidentalmente después
      this.storageService.limpiarDatosUsuario?.();
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('idUsuario');

      Promise.all([
        this.cargarTipoDocumento(),
        this.cargarRoles()
      ]).then(() => {
        if (id) {
          this.usuarioId = id;
          this.modoEdicion = true;
          this.cargarUsuario();
        }
      });
    });

  }

  agregarRol(): void {
    if (this.rolAgregar) {
      const rolYaExiste = this.rolesUsuario.some(
        rol => rol.id === this.rolAgregar.id
      );

      if (rolYaExiste) {
        this.rolRepetido = true;
        this.openMensaje("El usuario ya tiene este rol asignado")
      } else {
        this.rolesUsuario.push(this.rolAgregar);
        this.usuario.roles = [...this.rolesUsuario];
        this.rolAgregar = null;
        this.rolRepetido = false;
      }
    }
  }

  quitarRol(index: number): void {
    this.rolesUsuario.splice(index, 1);
    this.usuario.roles = [...this.rolesUsuario];
  }

  cargarUsuario(): void {
    this.loading = true;
    this.usuarioService.getClientePorId(this.usuarioId).subscribe({
      next: (response: any) => {
        this.usuario = {
          ...response,
          tipoDocumento: null,
          roles: []
        };

        if (response.tipoDocumento) {
          const tipoDocEncontrado = this.tiposDocumento.find(
            t => t.id === response.tipoDocumento.id
          );
          this.usuario.tipoDocumento = tipoDocEncontrado || null;
        }

        if (response.roles && Array.isArray(response.roles)) {
          this.rolesUsuario = response.roles.map((rolRespuesta: any) => {
            const rolEncontrado = this.roles.find(r => r.id === rolRespuesta.id);
            return rolEncontrado || rolRespuesta;
          });
          this.usuario.roles = [...this.rolesUsuario];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuario', err);
        this.loading = false;
        this.openMensaje('Error al cargar los datos del usuario');
      }
    });
  }

  crearUsuario() {
    this.formEnviado = true;

    // Valida los campos obligatorios antes de continuar
    if (!this.usuario.nombre || !this.usuario.numeroDocumento || !this.usuario.tipoDocumento ||
      !this.usuario.correo || !this.usuario.contrasena || !this.usuario.celular || this.rolesUsuario.length === 0) {
      this.openMensaje('Por favor completa todos los campos obligatorios y asigna al menos un rol.');
      return;
    }

    if (!this.validarRolesIncompatibles()) {
      return;
    }

    this.usuario.roles = this.rolesUsuario.map(rol => ({
      ...rol,
      nombre: rol.nombre.startsWith('ROLE_') ? rol.nombre : `ROLE_${rol.nombre}`
    }));

    this.loading = true;

    if (this.modoEdicion) {
      // Actualizar usuario
      this.usuarioService.actualizarUsuarioConRoles(this.usuario).subscribe({
        next: (response) => {
          this.loading = false;
          this.openMensaje(response.mensaje || 'Usuario actualizado exitosamente');
          this.router.navigate(['/administradores/admin', this.nombre, 'usuarios']);
        },
        error: (err) => {
          this.loading = false;
          this.openMensaje(err.error?.mensaje || 'Error al actualizar usuario');
        }
      });
    } else {
      this.usuarioService.crearUsuarioConRoles(this.usuario).subscribe({
        next: (response) => {
          this.loading = false;
          this.openMensaje(response.mensaje || 'Usuario creado exitosamente');
          this.router.navigate(['/administradores/admin', this.nombre, 'usuarios']);
        },
        error: (err) => {
          this.loading = false;
          this.openMensaje(err.error?.mensaje || 'Error al crear usuario');
        }
      });
    }
  }


  cargarTipoDocumento(): Promise<void> {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.tipoDocumentoService.listar().subscribe({
        next: (tipos: TipoDocumento[]) => {
          this.tiposDocumento = tipos;
          this.loading = false;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar tipos de documento:', error);
          this.loading = false;
          this.openMensaje("Error al cargar los tipo de documento")
          reject(error);
        }
      });
    });
  }


  cargarRoles(): Promise<void> {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.roleService.listar().subscribe({
        next: (roles: Role[]) => {
          // Mapear y limpiar los nombres
          this.roles = roles.map(rol => ({
            ...rol,
            nombre: rol.nombre.replace(/^ROLE_/, '') // Elimina "ROLE_" al inicio
          }));
          this.loading = false;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar roles:', error);
          this.loading = false;
          this.openMensaje("Error al cargar los roles");
          reject(error);
        }
      });
    });
  }



  crearTipoDocumento() {
    this.guardarEstadoFormulario();
    this.router.navigate([
      '/administradores/admin', this.nombre, 'usuarios', 'agregar', 'tipo'
    ])
  }

  private validarRolesIncompatibles(): boolean {
    const rolesNombres = this.rolesUsuario.map(rol =>
      rol.nombre.toUpperCase().replace(/^ROLE_/, '')
    );

    const tieneAdmin = rolesNombres.includes('ADMIN');
    const tieneOrganizador = rolesNombres.includes('ORGANIZADOR');

    if (tieneAdmin && tieneOrganizador) {
      this.openMensaje('No se puede asignar los roles ADMIN y ORGANIZADOR al mismo usuario. Por favor, selecciona solo uno de estos roles.');
      return false;
    }

    return true;
  }

  private guardarEstadoFormulario() {
    const estadoFormulario = {
      usuario: this.usuario,
      rolesUsuario: this.rolesUsuario
    };
    this.storageService.guardarDatosUsuario(estadoFormulario);
  }



  goBack() {
    this.router.navigate([
      '/administradores/admin', this.nombre, 'usuarios'
    ])
  }

  openMensaje(mensajeT: string, confirmacion: boolean = false): Observable<Boolean> {
    let screenWidth = screen.width;
    let anchoDialog: string = '500px';
    let anchomax: string = '80vw';
    let altoDialog: string = '250';
    if (screenWidth <= 600) {
      anchoDialog = '100%';
      anchomax = '100%';
      altoDialog = 'auto';
    }
    const dialogRef = this.dialog.open(MensajeComponent, {
      width: anchoDialog,
      maxWidth: anchomax,
      height: altoDialog,
      data: {
        mensaje: mensajeT,
        mostrarBotones: confirmacion
      }
    });
    return dialogRef.afterClosed();
  }

}
