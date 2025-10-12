import { BaseConsoleCommand, BaseDatabaseConnection, BaseMongoDBConnection } from '@point-hub/papi'

import mongoDBConfig from '@/config/mongodb'

export default class DbSeedCommand extends BaseConsoleCommand {
  dbConnection = new BaseDatabaseConnection(new BaseMongoDBConnection(mongoDBConfig.url, mongoDBConfig.name))

  constructor() {
    super({
      name: 'db:demo',
      description: 'Preload database with default records for demo purpose',
      summary: 'Preload database with default records for demo purpose',
      arguments: [],
      options: [],
    })
  }
  async handle(): Promise<void> {
    let session
    try {
      await this.dbConnection.open()
      session = this.dbConnection.startSession()
      session.startTransaction()
      /**
       * Usage
       * ex: await this.seeds(['directory'], { session })
       */
      await this.seeds(['master/examples'], { session })
    } catch (error) {
      console.error(error)
      await session?.abortTransaction()
    } finally {
      await session?.commitTransaction()
      await session?.endSession()
      this.dbConnection.close()
    }
  }
  private async seeds(directories: string[], options: unknown): Promise<void> {
    for (const directory of directories) {
      // import seed function
      const { seed } = await import(`@/modules/${directory}/demo.seed`)
      // seed database
      await seed(this.dbConnection, options)
    }
  }
}
