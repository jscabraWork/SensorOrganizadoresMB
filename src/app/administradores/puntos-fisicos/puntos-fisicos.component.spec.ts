import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuntosFisicosComponent } from './puntos-fisicos.component';

describe('PuntosFisicosComponent', () => {
  let component: PuntosFisicosComponent;
  let fixture: ComponentFixture<PuntosFisicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuntosFisicosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuntosFisicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
