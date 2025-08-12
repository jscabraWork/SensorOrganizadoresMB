import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-ordenes',
  imports: [
      CommonModule,
      RouterModule,
      FormsModule
    ],
  templateUrl: './ordenes.component.html',
  styleUrl: './ordenes.component.scss'
})
export class OrdenesComponent implements OnInit {

  nombre:string
  extender:boolean

  constructor (
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.extender = true
    this.route.parent?.paramMap.subscribe(params => {
      this.nombre = params.get('nombre');
    });
  }

  extenderMenu(){
    this.extender=!this.extender
  }
}
