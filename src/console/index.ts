import { fileSearch } from '@point-hub/express-utils';
import { BaseConsoleCli } from '@point-hub/papi';
import { fileURLToPath, URL } from 'url';

export class ConsoleKernel {
  public path = fileURLToPath(new URL('.', import.meta.url));
  private command: BaseConsoleCli;

  constructor(command: BaseConsoleCli) {
    this.command = command;
  }

  /**
   * Register the commands for the application.
   *
   * @example
   * this.command.register(new ExampleCommand());
   */
  async register() {
    const result = await fileSearch('/*.command.(js|ts)', this.path, { maxDeep: 2, regExp: true });
    for (let i = 0; i < result.length; i++) {
      const { default: Command } = await import(`./${result[i].path}`);
      this.command.register(new Command());
    }
  }
}
