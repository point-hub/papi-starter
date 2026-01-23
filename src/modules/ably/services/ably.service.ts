import Ably from 'ably';

import ablyConfig from '@/config/ably';

export interface IAblyService {
  publish(channelName: string, event: string, data: Record<string, unknown>): Promise<void>;
}

let ably: Ably.Rest | null = null;

function getAbly(): Ably.Rest | null {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  if (!ably) {
    ably = new Ably.Rest({
      key: ablyConfig.ablyApiKey,
    });
  }

  return ably;
}

export const AblyService: IAblyService = {
  async publish(channelName, event, data) {
    const client = getAbly();

    if (!client) return;

    try {
      const channel = client.channels.get(channelName);
      await channel.publish(event, data);
    } catch (error) {
      console.error('[Ably] Failed to publish', error);
    }
  },
};
