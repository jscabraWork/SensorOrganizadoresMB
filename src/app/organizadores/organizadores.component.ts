import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { MenuOrganizadoresComponent } from './menu-organizadores/menu-organizadores.component';

@Component({
  selector: 'app-organizadores',
  standalone: true,
  imports: [RouterOutlet, MenuOrganizadoresComponent],
  templateUrl: './organizadores.component.html',
  styleUrl: './organizadores.component.scss'
})
export class OrganizadoresComponent {

  idOrganizador: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.idOrganizador = params['idOrganizador'];
    });
  }

}