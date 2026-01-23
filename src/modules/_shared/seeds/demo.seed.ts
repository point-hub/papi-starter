import { type IDatabase } from '@point-hub/papi';

import ExampleFactory from '@/modules/master/examples/factory';
import UserFactory from '@/modules/master/users/factory';

export const seed = async (dbConnection: IDatabase, options: Record<string, unknown>) => {
  console.info('[seed:demo]');

  const userFactory = new UserFactory(dbConnection, options);
  const user1 = await userFactory.create();
  const user2 = await userFactory.create();
  const user3 = await userFactory.create();

  const exampleFactory = new ExampleFactory(dbConnection, options);
  exampleFactory.state({ created_by_id: user1.inserted_id });
  exampleFactory.sequence([
    { created_by_id: user1.inserted_id },
    { created_by_id: user2.inserted_id },
    { created_by_id: user3.inserted_id },
  ]);
  await exampleFactory.createMany(100);
};
