import { BaseConsoleCommand, BaseDatabaseConnection, BaseMongoDBConnection } from '@point-hub/papi'

import mongoDBConfig from '@/config/mongodb'

export default class DbSeedCommand extends BaseConsoleCommand {
  dbConnection = new BaseDatabaseConnection(new BaseMongoDBConnection(mongoDBConfig.url, mongoDBConfig.name))
  constructor() {
    super({
      name: 'db:seed',
      description: 'Seed database',
      summary: 'Seed database',
      arguments: [],
      options: [],
    })
  }
  async handle(): Promise<void> {
    try {
      await this.dbConnection.open()
      await this.seed('example', 'examples')
    } catch (error) {
      console.error(error)
    } finally {
      this.dbConnection.close()
    }
  }
  private async seed(module: string, collection: string): Promise<void> {
    console.info(`[seed] seeding ${collection} data`)
    // get seeder from module
    const { seeds } = await import(`@/modules/${module}/seed`)
    console.info(seeds)
    // delete all data inside collection
    await this.dbConnection.collection(collection).deleteAll()
    // insert new seeder data
    await this.dbConnection.collection(collection).createMany(seeds)
  }
}
