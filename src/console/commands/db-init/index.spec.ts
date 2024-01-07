import { expect, it, spyOn } from 'bun:test'

import InitCommand from './index.command'

it('test command', async () => {
  const initCommand = new InitCommand()
  const spy = spyOn(initCommand, 'handle')
  await initCommand.handle()

  expect(spy).toHaveBeenCalled()
})
