import { type IDatabase } from '@point-hub/papi';

import CounterFactory from '@/modules/counters/factory';
import PermissionFactory from '@/modules/master/permissions/factory';
import RoleFactory from '@/modules/master/roles/factory';
import UserFactory from '@/modules/master/users/factory';
import { PasswordService } from '@/modules/master/users/services/password.service';

import { getCounters } from '../data/counters';
import { getPermissions } from '../data/permissions';

export const seed = async (dbConnection: IDatabase, options: Record<string, unknown>) => {
  console.info('[seed] counters');
  const counterFactory = new CounterFactory(dbConnection, options);
  const counters = getCounters();
  for (const counter of counters) {
    counterFactory.state(counter);
    await counterFactory.create();
  }

  console.info('[seed] permissions');
  const permissionFactory = new PermissionFactory(dbConnection, options);
  const permissions = getPermissions();
  for (const name of permissions) {
    permissionFactory.state({ name });
    await permissionFactory.create();
  }

  console.info('[seed] roles');
  const roleFactory = new RoleFactory(dbConnection, options);
  roleFactory.state({
    code: 'ROLE/0001',
    name: 'admin',
    notes: '',
    permissions,
  });
  const responseCreateRole = await roleFactory.create();

  console.info('[seed] users');
  const username = 'admin';
  const password = 'Admin123!';
  const userFactory = new UserFactory(dbConnection, options);
  userFactory.state({
    name: username,
    username: username,
    trimmed_username: username,
    email: 'admin@example.com',
    trimmed_email: 'admin@example.com',
    password: await PasswordService.hash(password),
    email_verification: {
      is_verified: true,
      verified_at: new Date(),
    },
    role_id: responseCreateRole.inserted_id,
    created_at: new Date(),
  });

  await userFactory.create();

  console.info(`u: ${username}`);
  console.info(`p: ${password}`);
  console.info('please change your password immediately');
};
