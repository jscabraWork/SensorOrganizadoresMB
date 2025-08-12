import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExpandedRowConfig, TableComponent } from '../../../commons-ui/table/table.component';
import { Filter, SearchFilterComponent } from '../../../commons-ui/search-filter/search-filter.component';
import { UsuarioDataService } from '../../../service/data/usuario-data.service';
import { MatDialog } from '@angular/material/dialog';
import { Page } from '../../../models/page.mode';
import { Usuario } from '../../../models/usuario.model';
import { HardcodedAutheticationService } from '../../../service/hardcoded-authetication.service';
import { MensajeComponent } from '../../../mensaje/mensaje.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-usuarios-activos-inactivos',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableComponent,
    SearchFilterComponent
  ],
  templateUrl: './usuarios-activos-inactivos.component.html',
  styleUrl: './usuarios-activos-inactivos.component.scss'
})
export class UsuariosActivosInactivosComponent {

  paginaActual: number = 0
  tamañoPagina: number = 25
  totalUsuarios: number = 0
  roleId: number
  nombre: string
  id: string
  correo: string
  cargando: boolean
  selectedItem: number | null = null;
  usuarioSeleccionado: Usuario | null = null;
  usuariosPage: Page<Usuario> | null = null;

  searchFilters: Filter[] = [
    {
      key: 'correo',
      value: '',
      placeholder: 'Buscar Por Correo',
      label: 'Correo',
      onEnter: (valor: string) => this.buscarPorCorreo(valor)
    },
    {
      key: 'documento',
      value: '',
      placeholder: 'Buscar Por Numero Documento',
      label: 'Numero Documento',
      onEnter: (valor: string) => this.buscarPorDocumento(valor)
    }
  ]

  expandableConfig: ExpandedRowConfig = {
    infoFields: [
      { label: 'Numero de Documento', property: 'numeroDocumento' },
      { label: 'Nombre Completo', property: 'nombre' },
      { label: 'Correo Electrónico', property: 'correo' },
      { label: 'Número de Celular', property: 'celular' },
      { label: 'Estado', property: 'estado' },
    ],
    actionButtons: [
      {
        text: 'Editar',
        class: 'btn-editar',
        action: (usuario: any) => this.editarUsuario(usuario)
      },
      {
        text: 'Perfil',
        class: 'btn-perfil',
        action: (usuario: any) => this.verDetallesUsuario()
      }
    ],
    selects: [
      {
        property: 'enabled',
        options: [
          { value: true, label: 'Activo' },
          { value: false, label: 'Inactivo' }
        ],
        action: (usuario: Usuario) => this.cambiarEstadoUsuario(usuario),
        class: 'select-estado',
        label: 'Estado '
      }
    ]
  };


  private readonly roleMap = {
    'clientes': 2,
    'organizadores': 3,
    'coordinadores': 4,
    'analistas': 15,
    'promotores': 6,
    'auditores': 16,
    'administradores': 1,
    'puntosfisicos': 8,

  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioDataService,
    private autenticado: HardcodedAutheticationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin()

    this.route.url.subscribe(segments => {
      this.determineRoleId();
      this.cargarUsuarios();
    });

  }

  private determineRoleId(): void {
    const currentPath = this.router.url.split('/').pop();
    this.roleId = this.roleMap[currentPath] || 0;
  }

  cargarUsuarios(): void {
    this.cargando = true
    const pagina = (this.paginaActual !== undefined && this.paginaActual !== null) ? this.paginaActual : 0;
    this.usuarioService.getUsuariosPaginados(pagina, this.roleId).subscribe({
      next: (response: any) => {
        this.usuariosPage = {
          ...response.usuarios,
          content: response.usuarios.content.map(usuario => ({
            ...usuario,
            estado: usuario.enabled ? 'Activo' : 'Inactivo'
          }))
        };
        this.totalUsuarios = response.totalElements
        this.paginaActual = response.number
        this.tamañoPagina = response.size
        this.cargando = false
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error)
        this.usuariosPage = {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: this.tamañoPagina,
          number: this.paginaActual
        }
        this.totalUsuarios = 0
        this.cargando = false

      }
    })
  }

  onExpandRow(usuario: Usuario | null): void {
    this.usuarioSeleccionado = usuario;
    if (usuario) {
    }
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.cargarUsuarios()
  }


  buscarPorCorreo(correo: string) {
    if (!correo || correo.trim() === '') {
      this.limpiarFiltro()
      return;
    }

    this.cargando = true;

    this.usuarioService.buscarPorCorreo(correo.trim()).subscribe({
      next: (usuario: Usuario) => {
        if (usuario && usuario.numeroDocumento) {
          this.usuariosPage = {
            content: [usuario],
            totalElements: 1,
            totalPages: 1,
            size: 1,
            number: 0
          };
          this.totalUsuarios = 1;
          this.paginaActual = 0;
        } else {
          this.openMensaje(`No se encontró ningún usuario con el correo: ${correo}`);
          this.limpiarFiltro()
        }
        this.cargando = false;
      },
      error: () => {
        this.openMensaje(`No se encontró ningún usuario con el correo: ${correo}`);
        this.limpiarFiltro()
        this.cargando = false;
      }
    });
  }

  buscarPorDocumento(documento: string) {
    if (!documento || documento.trim() === '') {
      this.limpiarFiltro()
      return; 
    }

    this.cargando = true;

    this.usuarioService.buscarUsuarioPorDocumento(this.roleId, documento.trim()).subscribe({
      next: (usuario: Usuario) => {
        if (usuario && usuario.numeroDocumento) {
          this.usuariosPage = {
            content: [usuario],
            totalElements: 1,
            totalPages: 1,
            size: 1,
            number: 0
          };
          this.totalUsuarios = 1;
          this.paginaActual = 0;
        } else {
          this.openMensaje(`No se encontró ningún usuario con el documento: ${documento}`);
           this.limpiarFiltro()
        }
        this.cargando = false;
      },
      error: () => {
        this.openMensaje(`No se encontró ningún usuario con el documento: ${documento}`);
        this.cargando = false;
        this.limpiarFiltro()
      }
    });
  }

  limpiarFiltro() {
    this.searchFilters = this.searchFilters.map(filter => ({
      ...filter,
      value: ''
    }));
  }

  onBuscarGeneral(filtros: { [key: string]: string }) {
    const correo = filtros['correo']?.trim();
    const documento = filtros['documento']?.trim();

    if (correo) {
      this.buscarPorCorreo(correo);
    } else if (documento) {
      this.buscarPorDocumento(documento);
    } else {
      this.cargarUsuarios();
    }
  }


  cambiarEstadoUsuario(usuario: Usuario): void {
    this.cargando = true
    this.usuarioService.cambiarEstadoEnabled(usuario.numeroDocumento).subscribe({
      next: () => {
        this.cargando = false
        this.openMensaje(`El estado del usuario fue actualizado correctamente.`);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.cargando = false
        console.error('Error al cambiar el estado del usuario:', err);
        this.openMensaje('Ocurrió un error al cambiar el estado del usuario.');
      }
    });
  }




  verDetallesUsuario() {

  }

  editarUsuario(usuario: Usuario) {
    this.router.navigate(['/administradores/admin', this.nombre, 'usuarios', 'editar', usuario.numeroDocumento]);
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
