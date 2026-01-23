import { expect, it, spyOn } from 'bun:test';

import SeedCommand from './index.command';

it('test command', async () => {
  const seedCommand = new SeedCommand();
  const spy = spyOn(seedCommand, 'handle');
  await seedCommand.handle();

  expect(spy).toHaveBeenCalled();
});
