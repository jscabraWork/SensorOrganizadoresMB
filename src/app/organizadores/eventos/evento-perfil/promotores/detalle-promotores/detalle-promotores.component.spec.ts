import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePromotoresComponent } from './detalle-promotores.component';

describe('DetallePromotoresComponent', () => {
  let component: DetallePromotoresComponent;
  let fixture: ComponentFixture<DetallePromotoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePromotoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallePromotoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
