#!/usr/bin/env node

import { BaseConsoleCli, BaseConsoleKernel } from '@point-hub/papi'

import { version } from './package.json'
import { ConsoleKernel as AppKernel } from './src/console'

// Initiate CLI
const cli = new BaseConsoleCli('bun cli.ts', version)
// Register Papi Commands
await new BaseConsoleKernel(cli).register()
// Register Application Commands
await new AppKernel(cli).register()
// Build CLI
cli.run(process.argv)
