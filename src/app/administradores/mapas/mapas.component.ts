import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonListarComponent } from '../../commons-components/common-listar/common-listar.component';
import { MapasDataService } from '../../service/data/mapas-data.service';
import { Mapa } from '../../models/mapas/mapa.model';
import { TableComponent, TablaBotonConfig } from '../../commons-ui/table/table.component';
import { TitleComponent } from '../../commons-ui/title/title.component';

@Component({
  selector: 'app-mapas',
  imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        TableComponent,
        TitleComponent
      ],
  templateUrl: './mapas.component.html',
  styleUrl: './mapas.component.scss'
})
export class MapasComponent extends CommonListarComponent<Mapa, MapasDataService> implements OnInit {
  
  headers = ['ID', 'Nombre', 'Evento', 'Ancho', 'Alto', 'Acciones'];
  columnas = ['id', 'nombre', 'evento.nombre', 'ancho', 'alto', 'acciones'];
  botones: TablaBotonConfig[] = [
    {
      texto: 'Editar',
      clase: 'btn-editar',
      accion: (mapa: Mapa) => this.editarMapa(mapa)
    },
    {
      texto: 'Eliminar',
      clase: 'btn-eliminar',
      accion: (mapa: Mapa) => this.delete(mapa.id)
    }
  ];

  constructor(
    mapasService: MapasDataService,
    dialog: MatDialog,
    private router: Router,
        private route: ActivatedRoute

  ){
    super(mapasService, dialog);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }


  override refrescar(){
    this.cargando = true
    this.service.listar().subscribe({next:response=>{     
      this.cargando = false
      this.manejar(response)
    },error:error=>{
      this.cargando = false
      this.mensaje("Sucedio un error por favor vuelve a intentar")
    }})
  }

  override manejar(response: any): void {
    this.lista = response;
  }

  editarMapa(mapa: Mapa): void {
    this.router.navigate(['modificar/', mapa.id], { relativeTo: this.route });
  }

  crear(): void {
    this.router.navigate(['crear'], { relativeTo: this.route });
  }



}
