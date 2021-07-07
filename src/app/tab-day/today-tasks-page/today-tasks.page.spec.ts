import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TodayTasksPage } from './today-tasks.page';

describe('TodayTasksPage', () => {
  let component: TodayTasksPage;
  let fixture: ComponentFixture<TodayTasksPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TodayTasksPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TodayTasksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
