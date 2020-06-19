import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VisionsPage } from './visions.page';

describe('ManagePage', () => {
  let component: VisionsPage;
  let fixture: ComponentFixture<VisionsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VisionsPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VisionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
