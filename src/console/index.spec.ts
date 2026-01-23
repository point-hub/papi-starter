import { BaseConsoleCli } from '@point-hub/papi';
import { expect, it } from 'bun:test';

import { ConsoleKernel } from './index.js';

it('express app to be defined', async () => {
  const cli = new BaseConsoleCli('cli', '1.0.0');

  const kernel = new ConsoleKernel(cli);
  await kernel.register();

  expect(cli).toBeDefined();
  expect(cli).toBeInstanceOf(BaseConsoleCli);
});
