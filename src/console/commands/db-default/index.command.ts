import { BaseConsoleCommand, BaseDatabaseConnection, BaseMongoDBConnection } from '@point-hub/papi'

import mongoDBConfig from '@/config/mongodb'

export default class DbSeedCommand extends BaseConsoleCommand {
  dbConnection = new BaseDatabaseConnection(new BaseMongoDBConnection(mongoDBConfig.url, mongoDBConfig.name))

  constructor() {
    super({
      name: 'db:default',
      description: 'Populate database with default entries',
      summary: 'Populate database with default entries',
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
      await this.seeds(['examples'], { session })
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
      const { seed } = await import(`@/modules/${directory}/default.seed`)
      // seed database
      await seed(this.dbConnection, options)
    }
  }
}
