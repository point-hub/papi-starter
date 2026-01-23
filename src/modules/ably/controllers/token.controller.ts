import type { IController, IControllerInput } from '@point-hub/papi';
import * as Ably from 'ably';

import { ablyApiKey } from '@/config/ably';

export const tokenController: IController = async (controllerInput: IControllerInput) => {
  const ably = new Ably.Rest({ key: ablyApiKey });
  const userId = controllerInput.req.authUser._id;

  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: userId,
    capability: {
      [`notifications:${userId}`]: ['subscribe', 'presence'],
    },
  });

  controllerInput.res.status(200);
  controllerInput.res.json(tokenRequest);
};
