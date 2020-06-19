import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalBacklogPage } from './goal-backlog.component';

describe('GoalBacklogPage', () => {
  let component: GoalBacklogPage;
  let fixture: ComponentFixture<GoalBacklogPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoalBacklogPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalBacklogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
