import {
  MongoDBContainer,
  StartedMongoDBContainer,
} from '@testcontainers/mongodb';
import mongoose from 'mongoose';

// FAZER MERGE DOS OBJETOS NOS TESTES UNITÁRIOS
// TORNAR ESTA CLASSE SINGLETON
// PENSAR SE VALE A PENA APLICAR PADRÃO DE PROJETO AQUI, VISTO QUE É PARA TESTES
// DEIXAR O START DO CONTAINER NO ARQUIVO DE SETUP
// NO BEFORE EACH, ABRIR CONEXÃO
// NO AFTER EACH, LIMPAR TUDO
// AFTER ALL, MATAR A CONEXÃO

export class MongoTestContainer {
  private static instance: MongoTestContainer;
  private mongoDbContainer: Promise<StartedMongoDBContainer>;

  public static getInstance(): MongoTestContainer {
    if (!MongoTestContainer.instance)
      MongoTestContainer.instance = new MongoTestContainer();

    return this.instance;
  }

  private constructor() {
    this.mongoDbContainer = new MongoDBContainer('mongo:8.0-noble').start();
  }

  async connect(): Promise<void> {
    const uri = await this.getConnectionString();
    await mongoose
      .connect(uri, { directConnection: true })
      .catch((err) => console.error(err));
  }

  async closeDatabase(): Promise<void> {
    await mongoose.connection.dropDatabase();
    if (mongoose.connection.readyState === 1) await mongoose.disconnect();

    (await this.mongoDbContainer).stop().catch((err) => console.log(err));
  }

  async clearDatabase(): Promise<void> {
    const conn = mongoose.connection;
    const collections = Object.values(conn.collections);
    for (const coll of collections) {
      await coll.deleteMany({});
    }
  }

  private async getConnectionString(): Promise<string> {
    const url = (await this.mongoDbContainer).getConnectionString();
    return url;
  }
}
