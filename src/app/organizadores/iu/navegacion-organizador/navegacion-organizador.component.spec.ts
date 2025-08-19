import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavegacionOrganizadorComponent } from './navegacion-organizador.component';


describe('NavegacionOrganizadorComponent', () => {
  let component: NavegacionOrganizadorComponent;
  let fixture: ComponentFixture<NavegacionOrganizadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavegacionOrganizadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavegacionOrganizadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
