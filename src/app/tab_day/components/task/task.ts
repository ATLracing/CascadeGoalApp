import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task, DatabaseManager, Goal, Vision, ExpandedTask } from 'src/app/providers/database_manager';

@Component({
  selector: 'task-component',
  templateUrl: 'task.html',
  styleUrls: ['task.scss']
})
export class TaskListComponent {
  @Input() task : ExpandedTask;
  @Output() modified_task_emitter = new EventEmitter<Task>();

  constructor() {
  }

  sendMessageToParent(task: Task) {
    this.modified_task_emitter.emit(task);
  }
}
