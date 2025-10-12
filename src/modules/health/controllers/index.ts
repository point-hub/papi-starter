import type { IController } from '@point-hub/papi'

import { version } from '@/../package.json'

export const healthController: IController = async () => {
  return {
    status: 200,
    json: {
      version: version,
      status: 'healthy',
      timestamp: new Date(),
    },
  }
}
