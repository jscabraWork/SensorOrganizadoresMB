import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorContenidoComponent } from './editor-contenido.component';


describe('EditorContenidoComponent', () => {
  let component: EditorContenidoComponent;
  let fixture: ComponentFixture<EditorContenidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorContenidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorContenidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
