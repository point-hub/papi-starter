import { type IDatabase } from '@point-hub/papi'

export const seed = async (dbConnection: IDatabase, options: unknown) => {
  console.info(`[truncate] module_examples data`)
  // delete all data inside collection
  await dbConnection.collection('module_examples').deleteAll(options)
}
