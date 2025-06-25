import './utils/module-alias';
import 'reflect-metadata';
import './di/container-setup';
import 'express-async-errors';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { Application } from 'express';
import { TaskController } from './presentation/controllers/TaskController';
import { container } from 'tsyringe';
import {
  errorHandler,
  NotFoundHandler,
} from './presentation/middlewares/errors';

export class SetupServer extends Server {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    super();
  }

  public init(): void {
    this.setupExpress();
    this.setupControllers();
    this.setupGlobalErrorHandler();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.set('json spaces', 2);
  }

  private setupControllers(): void {
    const taskController = container.resolve<TaskController>(TaskController);

    super.addControllers([taskController]);
  }

  private setupGlobalErrorHandler(): void {
    this.app.use(NotFoundHandler.bind(this));
    this.app.use(errorHandler.bind(this));
  }

  public start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`Server listening on port: ${port}`);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}
