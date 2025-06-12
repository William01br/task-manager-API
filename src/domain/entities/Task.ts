// Representa a entidade "Task" de forma pura, com seus atributos e eventuais métodos que implementem regras de negócio.

export class Task {
  public title: string;
  public description: string;
  public isDone: boolean;
  constructor(data: { title: string; description: string; isDone: boolean }) {
    this.title = data.title;
    this.description = data.description;
    this.isDone = data.isDone;
  }
}
