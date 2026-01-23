import type { IController, IControllerInput } from '@point-hub/papi';

import { version } from '@/../package.json';

import { formatUptime } from '../utils/format-uptime';

export const healthController: IController = async (controllerInput: IControllerInput) => {
  const rawUptimeSeconds = process.uptime();
  controllerInput.res.status(200);
  controllerInput.res.json({
    version: version,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: rawUptimeSeconds,
    uptime_formatted: formatUptime(rawUptimeSeconds),
  });
};
