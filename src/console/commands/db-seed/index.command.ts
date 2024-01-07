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
      await this.seed('examples')
    } catch (error) {
      console.error(error)
    } finally {
      this.dbConnection.close()
    }
  }
  private async seed(collectionName: string): Promise<void> {
    console.info(`[seed] seeding ${collectionName} data`)
    // get seeder from module
    const { seeds } = await import('@/modules/example/seed')
    console.info(seeds)
    // delete all data inside collection
    await this.dbConnection.collection(collectionName).deleteAll()
    // insert new seeder data
    await this.dbConnection.collection(collectionName).createMany(seeds)
  }
}
