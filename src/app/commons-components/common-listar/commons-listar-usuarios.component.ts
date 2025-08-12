import { Directive, OnInit } from '@angular/core';
import { GenericUsuario } from '../../service/commons/generic-usuario.model';
import { CommonDataServiceUsuario } from '../../service/commons/common-data-usuario.service';
@Directive()
export abstract class CommonListarUsuariosComponent <E extends GenericUsuario,S extends CommonDataServiceUsuario<E>> implements OnInit{

  selectedItem: number | null = null;
  lista:E[]
  listaFiltrada:E[]
  protected message;
  protected role:string
  busquedaPorNombre: string = ""; // Campo para búsqueda por nombre
  busquedaPorId: string = ""; // Campo para búsqueda por ID
  constructor(protected service: S) { }
  ngOnInit(): void {  
  
    this.lista=[]
    this.refrescar()
  }

  refrescar(){

    this.service.listar(this.role).subscribe({next:response=>{     
      this.manejar(response)
    },error:error=>{
      alert("Sucedio un error por favor vuelve a intentar")
    }})
  }
  manejar(response){
    this.lista = response.usuarios
    this.listaFiltrada = this.lista
  }
  acceso(id:string,i:number){
    if(confirm("Desea Cambiar el acceso?")){
      this.service.acceso(id).subscribe({next:response=>{
        this.lista[i].enabled=response.enabled
        this.message="Se borro exitosamente "+id
      },error:error=>{
        alert("Sucedio un error por favor vuelve a intentar")
      }})
    }
    else{
      alert("No se realizo el borrado")
    }

  }

    //desplegar y replegar info detallada de cada evento
    toggleItem(index: number) {
      if (this.selectedItem === index) {
        this.selectedItem = null;
      } else {
        this.selectedItem = index;
      }
    }
  
    buscar() {
      if (this.busquedaPorNombre || this.busquedaPorId) {
        this.listaFiltrada = this.lista.filter(orga => {
          const matchNombre = this.busquedaPorNombre ?
            orga.nombre.toLowerCase().includes(this.busquedaPorNombre.toLowerCase()) : true;
          const matchId = this.busquedaPorId ?
            orga.numeroDocumento.toLowerCase().includes(this.busquedaPorId.toLowerCase()) : true;
          return matchNombre && matchId;
        });
      } else {
        this.listaFiltrada = this.lista
      }
    }
}
