import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { AdministradoresComponent } from './administradores/administradores.component';
import { HomeAdminComponent } from './administradores/home-admin/home-admin.component';
import { RouteGuardAdminService } from './service/route-guard-admin.service';
import { TemporadasComponent } from './administradores/temporadas/temporadas.component';
import { AgregarTemporadaComponent } from './administradores/temporadas/agregar-temporada/agregar-temporada.component';
import { CiudadesComponent } from './administradores/ciudades/ciudades.component';
import { AgregarCiudadComponent } from './administradores/ciudades/agregar-ciudad/agregar-ciudad.component';
import { EventosComponent } from './administradores/eventos/eventos.component';
import { AgregarEventoComponent } from './administradores/eventos/agregar-evento/agregar-evento.component';
import { AgregarTipoComponent } from './administradores/eventos/agregar-evento/agregar-tipo/agregar-tipo.component';
import { VenuesComponent } from './administradores/venues/venues.component';
import { AgregarVenueComponent } from './administradores/venues/agregar-venue/agregar-venue.component';
import { DiasComponent } from './administradores/eventos/dias/dias.component';
import { DiasActivosInactivosComponent } from './administradores/eventos/dias/dias-activos-inactivos/dias-activos-inactivos.component';
import { AgregarDiaComponent } from './administradores/eventos/dias/agregar-dia/agregar-dia.component';
import { MapasComponent } from './administradores/mapas/mapas.component';
import { LocalidadesComponent } from './administradores/eventos/dias/localidades/localidades.component';
import { AgregarLocalidadComponent } from './administradores/eventos/dias/localidades/agregar-localidad/agregar-localidad.component';
import { TransaccionesComponent } from './administradores/transacciones/transacciones.component';
import { EventosActivosInactivosComponent } from './administradores/eventos/eventos-activos-inactivos/eventos-activos-inactivos.component';
import { TemporadasActivasInactivasComponent } from './administradores/temporadas/temporadas-activas-inactivas/temporadas-activas-inactivas.component';
import { LocalidadesActivasInactivasComponent } from './administradores/eventos/dias/localidades/localidades-activas-inactivas/localidades-activas-inactivas.component';
import { TarifasComponent } from './administradores/eventos/tarifas/tarifas.component';
import { TarifasActivasInactivasComponent } from './administradores/eventos/tarifas/tarifas-activas-inactivas/tarifas-activas-inactivas.component';
import { AgregarTarifaComponent } from './administradores/eventos/tarifas/agregar-tarifa/agregar-tarifa.component';
import { NumeroOrdenClienteComponent } from './administradores/ordenes/numero-orden-cliente/numero-orden-cliente.component';
import { OrdenesComponent } from './administradores/ordenes/ordenes.component';
import { PaginasComponent } from './administradores/paginas/paginas.component';
import { CrearModificarPaginasComponent } from './administradores/paginas/crear-modificar-paginas/crear-modificar-paginas.component';
import { TicketsComponent } from './administradores/eventos/dias/localidades/tickets/tickets.component';
import { AgregarTicketsComponent } from './administradores/eventos/dias/localidades/tickets/agregar-tickets/agregar-tickets.component';
import { TicketsActivosInactivosComponent } from './administradores/eventos/dias/localidades/tickets/tickets-activos-inactivos/tickets-activos-inactivos.component';
import { OrdenesClienteComponent } from './administradores/ordenes/ordenes-cliente/ordenes-cliente.component';
import { UsuariosComponent } from './administradores/usuarios/usuarios.component';
import { AgregarModificarUsuarioComponent } from './administradores/usuarios/agregar-modificar-usuario/agregar-modificar-usuario.component';
import { UsuariosActivosInactivosComponent } from './administradores/usuarios/usuarios-activos-inactivos/usuarios-activos-inactivos.component';
import { RecursosComponent } from './administradores/paginas/crear-modificar-paginas/recursos/recursos.component';
import { CrearModificarMapaComponent } from './administradores/mapas/crear-modificar-mapa/crear-modificar-mapa.component';
import { AgregarModificarTipoDocumentoComponent } from './administradores/usuarios/agregar-modificar-usuario/agregar-modificar-tipo-documento/agregar-modificar-tipo-documento.component';
import { PromotoresComponent } from './administradores/promotores/promotores.component';
import { PuntosFisicosComponent } from './administradores/puntos-fisicos/puntos-fisicos.component';
import { GestionarCuponesComponent } from './administradores/eventos/tarifas/gestionar-cupones/gestionar-cupones.component';

const localidadesChildren: Routes = [
  { path: '', redirectTo: 'activas', pathMatch: 'full' },
  { path: 'activas', component: LocalidadesActivasInactivasComponent },
  { path: 'inactivas', component: LocalidadesActivasInactivasComponent }
];

const tarifasChildren: Routes = [
  { path: '', redirectTo: 'activas', pathMatch: 'full' },
  { path: 'activas', component: TarifasActivasInactivasComponent },
  { path: 'inactivas', component: TarifasActivasInactivasComponent },
  { path: 'cupones-activos', component: TarifasActivasInactivasComponent },
  { path: 'soldout', component: TarifasActivasInactivasComponent }

]

const ticketsChildren: Routes = [
  { path: '', redirectTo: 'disponibles', pathMatch: 'full' },
  { path: 'vendidos', component: TicketsActivosInactivosComponent },
  { path: 'disponibles', component: TicketsActivosInactivosComponent },
  { path: 'reservados', component: TicketsActivosInactivosComponent }
  ,{ path: 'proceso', component: TicketsActivosInactivosComponent }
]

const eventosChildren: Routes = [
  { path: '', redirectTo: 'visibles', pathMatch: 'full' },
  { path: 'creados', component: EventosActivosInactivosComponent },
  { path: 'visibles', component: EventosActivosInactivosComponent },
  { path: 'ocultos', component: EventosActivosInactivosComponent }
  ,{ path: 'terminados', component: EventosActivosInactivosComponent }
]

const usuariosChildren: Routes = [
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },
  { path: 'clientes', component: UsuariosActivosInactivosComponent },
  { path: 'organizadores', component: UsuariosActivosInactivosComponent },
  { path: 'coordinadores', component: UsuariosActivosInactivosComponent },
  { path: 'analistas', component: UsuariosActivosInactivosComponent },
  { path: 'promotores', component: UsuariosActivosInactivosComponent },
  { path: 'auditores', component: UsuariosActivosInactivosComponent },
  { path: 'puntosfisicos', component: UsuariosActivosInactivosComponent },
  { path: 'administradores', component: UsuariosActivosInactivosComponent },
];


export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: LoginComponent,
  },
  {
    path: 'logout',
    component: LogoutComponent
  },
      {
      path: 'administradores/admin/:nombre',
      component: AdministradoresComponent,
      canActivate: [RouteGuardAdminService],
      children: [
        {
          path: '',
          component: HomeAdminComponent,
          pathMatch: 'full'
        },
        {
          path: 'temporadas',
          component: TemporadasComponent,
          children: [
            {
              path: '',
              redirectTo: 'activas',
              pathMatch: 'full'
            },
            {
              path: 'activas',
              component: TemporadasActivasInactivasComponent
            },
            {
              path: 'inactivas',
              component: TemporadasActivasInactivasComponent
            }
          ]
        },
        {
          path: 'temporadas/agregar',
          component: AgregarTemporadaComponent
        },
        {
          path: 'temporadas/editar/:id',
          component: AgregarTemporadaComponent
        },
        {
          path: 'temporada/:idTemporada/eventos',
          component: EventosComponent,
          children: eventosChildren
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/dias',
          component: DiasComponent,
          children: [
            {
              path: '',
              redirectTo: 'activos',
              pathMatch: 'full'
            },
            {
              path: 'activos',
              component: DiasActivosInactivosComponent
            },
            {
              path: 'inactivos',
              component: DiasActivosInactivosComponent
            }
          ]
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/dia/:idDia/localidad/:idLocalidad/tarifas',
          component: TarifasComponent,
          children: tarifasChildren
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/localidad/:idLocalidad/tarifas',
          component: TarifasComponent,
          children: tarifasChildren
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/localidades',
          component: LocalidadesComponent,
          children: localidadesChildren
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/dia/:idDia/localidades',
          component: LocalidadesComponent,
          children: localidadesChildren
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/dia/:idDia/localidad/:idLocalidad/tickets',
          component: TicketsComponent,
          children: ticketsChildren
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/localidad/:idLocalidad/tickets',
          component: TicketsComponent,
          children: ticketsChildren
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/localidad/:idLocalidad/tickets/agregar',
          component: AgregarTicketsComponent
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/localidad/:idLocalidad/ticket/editar/:id',
          component: AgregarTicketsComponent
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/dia/:idDia/localidad/:idLocalidad/tickets/agregar',
          component: AgregarTicketsComponent
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/dia/:idDia/localidad/:idLocalidad/ticket/editar/:id',
          component: AgregarTicketsComponent
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/dia/:idDia/localidades/agregar',
          component: AgregarLocalidadComponent
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/localidades/agregar',
          component: AgregarLocalidadComponent
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/dia/:idDia/localidades/editar/:id',
          component: AgregarLocalidadComponent
        },
        {
          path: 'temporada/:idTemporada/evento/:idEvento/localidades/editar/:id',
          component: AgregarLocalidadComponent
        },
        {
            path: 'temporada/:idTemporada/eventos/agregar',
            component: AgregarEventoComponent
          },
          {
            path: 'temporada/:idTemporada/eventos/editar/:id',
            component: AgregarEventoComponent
          },
          {
            path: 'temporada/:idTemporada/eventos/agregar/tipo',
            component: AgregarTipoComponent
          },
          {
            path: 'temporada/:idTemporada/evento/:idEvento/dias/agregar',
            component: AgregarDiaComponent
          },
          {
            path: 'temporada/:idTemporada/evento/:idEvento/dias/editar/:id',
            component: AgregarDiaComponent
          },
          {
            path: 'temporada/:idTemporada/evento/:idEvento/dia/:idDia/localidades/:idLocalidad/tarifas/agregar',
            component: AgregarTarifaComponent
          },
          {
            path: 'temporada/:idTemporada/evento/:idEvento/localidades/:idLocalidad/tarifas/agregar',
            component: AgregarTarifaComponent
          },
          {
            path: 'temporada/:idTemporada/evento/:idEvento/localidades/:idLocalidad/tarifas/editar/:id',
            component: AgregarTarifaComponent
          },
          {
            path: 'temporada/:idTemporada/evento/:idEvento/dia/:idDia/localidades/:idLocalidad/tarifas/editar/:id',
            component: AgregarTarifaComponent
          },
          {
            path: 'temporada/:idTemporada/evento/:idEvento/dia/:idDia/localidades/:idLocalidad/tarifa/:idTarifa/cupones',
            component: GestionarCuponesComponent
          },
          {
            path: 'temporada/:idTemporada/evento/:idEvento/localidades/:idLocalidad/tarifa/:idTarifa/cupones',
            component: GestionarCuponesComponent
          },
          {
            path: 'temporada/:idTemporada/evento/:idEvento/dia/:idDia/localidades/:idLocalidad/tarifa/:idTarifa/cupones/editar/:idCupon',
            component: GestionarCuponesComponent
          },
          {
            path: 'temporada/:idTemporada/evento/:idEvento/localidades/:idLocalidad/tarifa/:idTarifa/cupones/editar/:idCupon',
            component: GestionarCuponesComponent
          },
          {
            path: 'ciudades',
            component: CiudadesComponent,
          },
          {
            path: 'ciudades/agregar',
            component: AgregarCiudadComponent
          },
          {
            path: 'ciudades/editar/:id',
            component: AgregarCiudadComponent
          },
          {
            path: 'ciudad/:idCiudad/venues',
            component: VenuesComponent
          },
          {
            path: 'ciudad/:idCiudad/venues/agregar',
            component: AgregarVenueComponent
          },
          {
            path: 'ciudad/:idCiudad/venues/editar/:id',
            component: AgregarVenueComponent
          },
          {
            path: 'ciudad/:idCiudad/venues/:idVenue/mapa/agregar',
            component: MapasComponent
          },
          {
            path: 'ciudad/:idCiudad/venues/:idVenue/mapa/editar/:id',
            component: MapasComponent
          },
          {
            path: 'transacciones',
            component: TransaccionesComponent
          },

      //--------------------------------------------
      //RUTAS DE PÁGINAS
      {
        path: 'paginas',
        component: PaginasComponent
      },
      {
        path: 'paginas/crear',
        component: CrearModificarPaginasComponent,

        children: [
          {
            path: ':paginaId',
            component: CrearModificarPaginasComponent,
          },
          {
            path: 'recursos',
            component: RecursosComponent
          },
        ]

      },
      {
        path: 'paginas/modificar/:paginaId',
        component: CrearModificarPaginasComponent,
        children: [
          {
            path: 'recursos',
            component: RecursosComponent
          },
        ]
      },

      //--------------------------------------------
      //RUTAS DE MAPAS

      {
        path: 'mapas',
        component: MapasComponent
      },
      {
        path: 'mapas/crear',
        component: CrearModificarMapaComponent,
      },
      {
        path: 'mapas/modificar/:mapaId',
        component: CrearModificarMapaComponent,
      },

      //--------------------------------------------

      {
        path: 'transacciones/ordenes',
        component: OrdenesComponent,
        children: [
          {
            path: '',
            redirectTo: 'orden',
            pathMatch: 'full'
          },
          {
            path: 'orden',
            component: NumeroOrdenClienteComponent
          },
          {
            path: 'cliente',
            component: OrdenesClienteComponent
          }
        ]
      },

      {
          path: 'promotores',
          component: PromotoresComponent
        },
        {
          path: 'puntosfisicos',
          component: PuntosFisicosComponent
        },

      //--------------- USUARIOS --------------------
      {
        path: 'usuarios',
        component: UsuariosComponent,
        children: usuariosChildren
      },
      {
        path: 'usuarios/agregar',
        component: AgregarModificarUsuarioComponent
      },
      {
        path: 'usuarios/editar/:idUsuario',
        component: AgregarModificarUsuarioComponent
      },
      {
        path: 'usuarios/agregar/tipo',
        component: AgregarModificarTipoDocumentoComponent
      }
    ],
  },
] 
