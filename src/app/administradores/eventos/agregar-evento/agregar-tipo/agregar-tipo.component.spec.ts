import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarTipoComponent } from './agregar-tipo.component';

describe('AgregarTipoComponent', () => {
  let component: AgregarTipoComponent;
  let fixture: ComponentFixture<AgregarTipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarTipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
