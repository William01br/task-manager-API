// Representa a entidade "Task" de forma pura, com seus atributos e eventuais métodos que implementem regras de negócio.

export class Task {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public isDone: boolean = false,
  ) {}

  public markDone(): void {
    this.isDone = true;
  }

  public markPending(): void {
    this.isDone = false;
  }
}
