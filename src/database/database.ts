import { BaseDatabaseConnection, BaseMongoDBConnection } from '@point-hub/papi'

import mongoDBConfig from '../config/mongodb'

const mongoDBConnection = new BaseMongoDBConnection(mongoDBConfig.url, mongoDBConfig.name)
export const dbConnection = new BaseDatabaseConnection(mongoDBConnection)
