import type { IServerConfig } from '@point-hub/papi';

export const port = Number(process.env['PORT'] || 3000);
export const host = `${process.env['HOST']}`;

const serverConfig: IServerConfig = {
  port,
  host,
};

export default serverConfig;
