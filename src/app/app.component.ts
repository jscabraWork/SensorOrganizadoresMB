import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HardcodedAutheticationService } from './service/hardcoded-authetication.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent {
  title = 'FrontMarcaBlancaAdministradores';

  constructor(public autenticador: HardcodedAutheticationService) { }


}
