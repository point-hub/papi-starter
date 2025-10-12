import { type IDatabase } from '@point-hub/papi'

export const seed = async (dbConnection: IDatabase, options: unknown) => {
  console.info(`[seed] examples data`)
  const documents: { name: string }[] = [{ name: 'example 1' }, { name: 'example 2' }]
  await dbConnection.collection('examples').createMany(documents, options)
}
