// Representa a entidade "Task" de forma pura, com seus atributos e eventuais métodos que implementem regras de negócio.

export interface Task {
  id: string;
  title: string;
  description: string;
  isDone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskResponseDTO extends Omit<Task, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export type TaskPreview = Pick<Task, 'title' | 'description' | 'isDone'>;

export type TaskCreateDTO = Pick<Task, 'title' | 'description'>;

// export type TaskResponseDTO = Pick<
//   Task,
//   'id' | 'title' | 'description' | 'isDone'>;

// export class Task {
//   public title: string;
//   public description: string;
//   public isDone: boolean;
//   constructor(data: { title: string; description: string; isDone: boolean }) {
//     this.title = data.title;
//     this.description = data.description;
//     this.isDone = data.isDone;
//   }
// }
