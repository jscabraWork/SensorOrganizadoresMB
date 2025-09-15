import { HardcodedAutheticationService } from './hardcoded-authetication.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouteGuardOrganizadorService {

  constructor(private autenticador:HardcodedAutheticationService, private route: Router, private router:ActivatedRoute) { }
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
    // Permitir acceso a organizadores logueados O administradores logueados
    if(this.autenticador.organizadorLoggin() || this.autenticador.adminLoggin()){
      return true;
    }
    else{
      this.route.navigate(['login']);
      return false;
    }
    
  }
}