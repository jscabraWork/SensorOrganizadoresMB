import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-alcancias',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './alcancias.component.html',
  styleUrl: './alcancias.component.scss'
})
export class AlcanciasComponent implements OnInit {

  nombre: string;
  extender: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.extender = true;
    this.route.parent?.paramMap.subscribe(params => {
      this.nombre = params.get('nombre');
    });
  }

  extenderMenu(): void {
    this.extender = !this.extender;
  }
}
