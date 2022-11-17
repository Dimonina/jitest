import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {KanbanBoardService, Task} from "./kanbanBoard.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {FormControl, Validators} from "@angular/forms";

interface TaskUIModel extends Task {
  canMoveLeft: boolean;
  canMoveRight: boolean;
}

@Component({
  selector: 'kanban-board',
  templateUrl: './kanbanBoard.component.html',
  styleUrls: ['./kanbanBoard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [KanbanBoardService]
})
export class KanbanBoard {
  constructor(private readonly kanbanBoardService: KanbanBoardService) {}

  stagesNames: string[] = ['Backlog', 'To Do', 'Ongoing', 'Done'];

  readonly taskNameFormControl = new FormControl('', { validators: [Validators.required] });

  readonly stagesTasks$: Observable<TaskUIModel[][]> = this.kanbanBoardService.tasks$.pipe(
    map(tasks =>{
      const result: TaskUIModel[][] = [];
      for (let i = 0; i < this.stagesNames.length; ++i) {
        result.push([]);
      }
      for (let task of tasks) {
        const taskUIModel: TaskUIModel = {...task, canMoveLeft: task.stage > 0, canMoveRight: task.stage < 3};
        const stageId = task.stage;
        result[stageId].push(taskUIModel);
      }

      return result;
    })
  );


  newTaskClick(): void {
    this.taskNameFormControl.updateValueAndValidity();
    if (this.taskNameFormControl.invalid) {
      console.debug('invalid');
      return;
    }

    this.kanbanBoardService.addTask(this.taskNameFormControl.value);
    this.taskNameFormControl.reset();
  }

  moveLeftClick(task: TaskUIModel) {
    this.kanbanBoardService.moveTo(task.name, 'left');
  }

  moveRightClick(task: TaskUIModel) {
    this.kanbanBoardService.moveTo(task.name, 'right');
  }

  deleteClick(task: TaskUIModel) {
    this.kanbanBoardService.removeTask(task.name);
  }


  generateTestId = (name) => {
    return name.split(' ').join('-');
  }
}


