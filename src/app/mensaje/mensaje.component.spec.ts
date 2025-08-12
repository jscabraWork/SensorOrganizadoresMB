import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MensajeComponent } from './mensaje.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('MensajeComponent', () => {
  let component: MensajeComponent;
  let fixture: ComponentFixture<MensajeComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const mockDialogData = {
    mensaje: '¿Estás seguro?',
    mostrarBotones: true,
    mostrarInputNumero: false
  };

 beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MensajeComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MensajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cerrar con true al confirmar sin input', () => {
    component.mostrarInputNumero = false;
    component.confirmar();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('debe cerrar con false al cancelar sin input', () => {
    component.mostrarInputNumero = false;
    component.cancelar();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
