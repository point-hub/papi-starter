import { type IMongoDBConfig } from '@point-hub/papi';

export const url = `${process.env['DATABASE_URL']}`;
export const name = `${process.env['DATABASE_NAME']}`;

const mongoDBConfig: IMongoDBConfig = {
  url,
  name,
};

export default mongoDBConfig;
