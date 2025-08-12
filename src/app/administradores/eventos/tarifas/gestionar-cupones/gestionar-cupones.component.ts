import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { Cupon } from '../../../../models/cupon.model';
import { Tarifa } from '../../../../models/tarifa.model';
import { CuponDataService } from '../../../../service/data/cupon-data.service';
import { TarifaDataService } from '../../../../service/data/tarifa-data.service';
import { HardcodedAutheticationService } from '../../../../service/hardcoded-authetication.service';
import { MensajeComponent } from '../../../../mensaje/mensaje.component';
import { TableComponent, ColumnaBotonConfig, ColumnaSelectConfig } from '../../../../commons-ui/table/table.component';
import { CommonListarComponent } from '../../../../commons-components/common-listar/common-listar.component';
import { TitleComponent } from '../../../../commons-ui/title/title.component';

@Component({
  selector: 'app-gestionar-cupones',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableComponent,
    TitleComponent
  ],
  templateUrl: './gestionar-cupones.component.html',
  styleUrl: './gestionar-cupones.component.scss'
})
export class GestionarCuponesComponent extends CommonListarComponent<Cupon, CuponDataService> implements OnInit {

  cupon: Cupon;
  tarifa: Tarifa;
  // cupones: Cupon[] = []; // Heredado como 'lista' de CommonListarComponent
  formEnviado = false;
  loading = false;
  // cargando = false; // Heredado de CommonListarComponent
  nombre: string;
  modoEdicion = false;
  cuponId: string;
  tarifaId: number;
  eventoId: number;
  diaId: number;
  localidadId: number;
  // temporadaId: number; // Removed for new routing
  esRutaPorEvento: boolean = false;
  mostrarFormulario = false;

  // Configuración para el componente TABLA
  headers: string[] = ['Código', 'Vigencia', 'Cant. Mín', 'Cant. Max', 'Venta Máx', 'Estado', 'Acciones'];
  columnas: string[] = ['codigo', 'vigencia', 'cantidadMinima', 'cantidadMaxima', 'ventaMaxima', 'estado', 'acciones'];
  columnaBotones: ColumnaBotonConfig[] = [];
  columnaSelects: ColumnaSelectConfig[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    protected cuponService: CuponDataService,
    private tarifaService: TarifaDataService,
    private autenticado: HardcodedAutheticationService,
    dialog: MatDialog
  ) {
    super(cuponService, dialog); // Llamar al constructor padre
    this.cupon = new Cupon();
    this.cupon.cantidadMaxima = 0;
    this.cupon.cantidadMinima = 0;
    this.cupon.ventaMaxima = 0;
  }

  // Getter para usar en el template (compatibilidad)
  get cupones(): Cupon[] {
    return this.lista || [];
  }

  override ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin();
    this.configurarTabla();

    this.route.paramMap.subscribe(params => {
      this.eventoId = Number(params.get('idEvento'));
      // this.temporadaId = Number(params.get('idTemporada')); // Removed for new routing
      this.localidadId = Number(params.get('idLocalidad'));
      this.tarifaId = Number(params.get('idTarifa'));
      this.diaId = params.has('idDia') ? Number(params.get('idDia')) : null;
      this.esRutaPorEvento = this.diaId === null;

      // Establecer el ID para el CommonListarComponent
      this.id = this.tarifaId;

      this.cargarTarifa();
      
      // Llamar al método padre para cargar cupones
      super.ngOnInit();

    });
  }

  configurarTabla() {
    // Configurar botones de acciones
    this.columnaBotones = [
      {
        columna: 'acciones',
        texto: 'Editar',
        clase: 'btn-editar',
        accion: (cupon: Cupon) => this.editarCupon(cupon)
      },
      {
        columna: 'acciones',
        texto: 'Eliminar',
        clase: 'btn-eliminar',
        accion: (cupon: Cupon) => this.eliminarCupon(cupon)
      }
    ];

    // Configurar select de estado
    this.columnaSelects = [
      {
        columna: 'estado',
        nombreCampo: 'estado',
        opciones: [
          { label: 'Activo', value: 1 },
          { label: 'Inactivo', value: 0 }
        ],
        clase: 'form-select estado-select',
        action: (cupon: Cupon) => this.cambiarEstadoCupon(cupon)
      }
    ];
  }

  cargarTarifa() {
    this.loading = true;
    this.tarifaService.getPorId(this.tarifaId).subscribe({
      next: (data) => {
        this.tarifa = data;
        this.loading = false;
        
        if (this.tarifa.estado !== 3) {
          this.mensaje('Esta tarifa no permite la creación de cupones');
        }
      },
      error: (error) => {
        console.error("Error al cargar la tarifa", error);
        this.loading = false;
        this.mensaje('Error al cargar los datos de la tarifa');
        this.goBack();
      }
    });
  }

  // Sobreescribir el método manejar del CommonListarComponent
  override manejar(response: any) {
    this.lista = response.cupones || response.lista || [];
    console.log("Cupones cargados:", this.lista);
  }



  crearCupon() {
    this.formEnviado = true;
    this.loading = true;

    if (!this.isFormValid()) {
      this.loading = false;
      return;
    }

    if (this.tarifa.estado !== 3) {
      this.loading = false;
      this.mensaje('Solo se pueden crear cupones para tarifas con estado 3');
      return;
    }

    if (this.modoEdicion) {
      this.actualizarCupon();
    } else {
      this.crearNuevoCupon();
    }
  }

  isFormValid(): boolean {
    return !!this.cupon.codigo &&
           !!this.cupon.vigencia;
  }

  crearNuevoCupon() {
  
    this.cupon.tarifa = this.tarifa;
    this.cupon.estado = 1;

    this.cuponService.crear(this.cupon).subscribe({
      next: (response) => {
        this.loading = false;
        this.mensaje('Cupón creado exitosamente');
        this.resetFormulario();
        this.mostrarFormulario = false;
        this.refrescar();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al crear cupón', error);
        this.mensaje('Error al crear el cupón');
      }
    });
  }

  actualizarCupon() {
    this.cuponService.actualizar(this.cupon.id, this.cupon).subscribe({
      next: (response) => {
        this.loading = false;
        this.mensaje("Cupón actualizado exitosamente");
        this.resetFormulario();
        this.mostrarFormulario = false;
        this.refrescar();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al actualizar cupón', error);
        this.mensaje('Error al actualizar el cupón');
      }
    });
  }

  editarCupon(cupon: Cupon) {
    this.cupon = { ...cupon };
    this.cuponId = cupon.id;
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    this.formEnviado = false;
  }

  eliminarCupon(cupon: Cupon) {
    // Usar el método delete heredado del CommonListarComponent
    super.delete(cupon.id);
  }

  cambiarEstadoCupon(cupon: Cupon) {
    this.cuponService.actualizar(cupon.id, cupon).subscribe({
      next: () => {
        this.mensaje('Estado del cupón actualizado exitosamente');
      },
      error: (error) => {
        console.error('Error al cambiar estado del cupón', error);
        this.mensaje('Error al cambiar el estado del cupón');
        this.refrescar(); // Usar método heredado para recargar
      }
    });
  }

  mostrarFormularioCrear() {
    if (this.tarifa && this.tarifa.estado !== 3) {
      this.mensaje('Solo se pueden crear cupones para tarifas con estado 3');
      return;
    }
    this.mostrarFormulario = true;
    this.modoEdicion = false;
    this.resetFormulario();
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.resetFormulario();
  }

  resetFormulario() {
    this.cupon = new Cupon();
    this.cupon.cantidadMaxima = 0; // Inicializar como false por defecto
    this.cupon.cantidadMinima = 0; // Permitir null para campos opcionales
    this.cupon.ventaMaxima = 0; // Permitir null para campos opcionales
    this.formEnviado = false;
    this.modoEdicion = false;
    this.cuponId = null;
  }

  // Método openMensaje eliminado - se usa el método 'mensaje' heredado de CommonListarComponent

  goBack() {
    if (this.esRutaPorEvento) {
      this.router.navigate([
        '/administradores/admin',
        this.nombre,
        'evento', this.eventoId,
        'localidad', this.localidadId,
        'tarifas'
      ]);
    } else {
      this.router.navigate([
        '/administradores/admin',
        this.nombre,
        'evento', this.eventoId,
        'dia', this.diaId,
        'localidad', this.localidadId,
        'tarifas'
      ]);
    }
  }
}
