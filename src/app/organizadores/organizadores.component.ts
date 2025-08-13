import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../commons-ui/navigation/navigation.component';

@Component({
  selector: 'app-organizadores',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent],
  templateUrl: './organizadores.component.html',
  styleUrl: './organizadores.component.scss'
})
export class OrganizadoresComponent {

}