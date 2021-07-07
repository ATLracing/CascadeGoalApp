import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WeekTasksPage } from './week_tasks.page';

describe('WeekTasksPage', () => {
  let component: WeekTasksPage;
  let fixture: ComponentFixture<WeekTasksPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WeekTasksPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WeekTasksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
