import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagenesEventosComponent } from './imagenes-eventos.component';

describe('ImagenesEventosComponent', () => {
  let component: ImagenesEventosComponent;
  let fixture: ComponentFixture<ImagenesEventosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagenesEventosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagenesEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
