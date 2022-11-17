import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {map} from "rxjs/operators";

export interface Task {
  name: string;
  stage: number;
}

interface State {
  tasks: Task[];
}

@Injectable()
export class KanbanBoardService {
  private readonly state$$ = new BehaviorSubject<State>({
    tasks: [
      {name: '0', stage: 0},
      {name: '1', stage: 0}
    ]
  });

  readonly tasks$: Observable<Task[]> = this.state$$.pipe(
    map(state => state.tasks)
  );

  addTask(name: string): void {
    const newTask: Task = {
      name,
      stage: 0
    };

    // check if task exist
    if (this.state$$.getValue().tasks.find(t => t.name === name) != null) {
      return;
    }

    const newTasks = [...this.state$$.getValue().tasks, newTask];
    this.updateState({tasks: newTasks});
  }

  removeTask(name: string): void {
    const tasks = this.state$$.getValue().tasks.filter(t => t.name !== name);
    this.updateState({tasks});
  }

  moveTo(name: string, direction: 'left' | 'right'): void {
    const task = this.state$$.getValue().tasks.find(t => t.name === name);
    if (task == null) {
      return;
    }
    const taskIndex = this.state$$.getValue().tasks.indexOf(task);
    let taskToUpdate: Task | null = null;
    if (direction === 'left' && task.stage > 0) {
      taskToUpdate = {...task, stage: task.stage - 1};
    } else if (direction === 'right' && task.stage < 3) {
      taskToUpdate = {...task, stage: task.stage + 1};
    }

    const tasks = [...this.state$$.getValue().tasks];
    tasks[taskIndex] = taskToUpdate;
    this.updateState({tasks});

  }

  private updateState(newState: Partial<State>): void {
    this.state$$.next({...this.state$$.getValue(), ...newState});
    console.debug('state updated to', this.state$$.getValue());
  }
}
