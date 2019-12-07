import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatabaseManager } from 'src/app/providers/database_manager';
import * as PackedRecord from 'src/app/providers/packed_record';
import * as InflatedRecord from 'src/app/providers/inflated_record';

@Component({
  selector: 'task-component',
  templateUrl: 'task.html',
  styleUrls: ['task.scss']
})
export class TaskListComponent {
  @Input() task : InflatedRecord.Task;
  @Output() modified_task_emitter = new EventEmitter<InflatedRecord.Task>();

  constructor() {
  }

  sendMessageToParent(task: InflatedRecord.Task) {
    this.modified_task_emitter.emit(task);
  }
}
