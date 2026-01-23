import { BaseConsoleCommand, BaseDatabaseConnection, BaseMongoDBConnection } from '@point-hub/papi';

import mongoDBConfig from '@/config/mongodb';

export default class DbSeedCommand extends BaseConsoleCommand {
  dbConnection = new BaseDatabaseConnection(new BaseMongoDBConnection(mongoDBConfig.url, mongoDBConfig.name));

  constructor() {
    super({
      name: 'db:demo',
      description: 'Preload database with default records for demo purpose',
      summary: 'Preload database with default records for demo purpose',
      arguments: [],
      options: [],
    });
  }

  async handle(): Promise<void> {
    let session;
    try {
      await this.dbConnection.open();
      session = this.dbConnection.startSession();
      session.startTransaction();
      // See demo example from /modules/_shared/seeds directory
      await this.seeds('demo', { session });
      await session?.commitTransaction();
    } catch (error) {
      console.error(error);
      await session?.abortTransaction();
    } finally {
      await session?.endSession();
      this.dbConnection.close();
    }
  }

  private async seeds(name: string, options: Record<string, unknown>): Promise<void> {
    const { seed } = await import(`@/modules/_shared/seeds/${name}.seed`);
    await seed(this.dbConnection, options);
  }
}
