import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarModificarTipoDocumentoComponent } from './agregar-modificar-tipo-documento.component';

describe('AgregarModificarTipoDocumentoComponent', () => {
  let component: AgregarModificarTipoDocumentoComponent;
  let fixture: ComponentFixture<AgregarModificarTipoDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarModificarTipoDocumentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarModificarTipoDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
