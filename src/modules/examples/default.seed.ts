import { type IDatabase } from '@point-hub/papi'

export const seed = async (dbConnection: IDatabase, options: unknown) => {
  console.info(`[truncate] examples data`)
  // delete all data inside collection
  await dbConnection.collection('examples').deleteAll(options)
}
