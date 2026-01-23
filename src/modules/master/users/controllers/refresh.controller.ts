import { type IController, type IControllerInput } from '@point-hub/papi';

import { TokenService } from '../services/token.service';

export const refreshController: IController = async (controllerInput: IControllerInput) => {
  controllerInput.res.status(200);
  const accessToken = TokenService.createAccessToken(controllerInput.req['authUser']?._id as string);
  controllerInput.res.cookie('papp_starter_access', accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes,
  });

  const refreshToken = TokenService.createRefreshToken(controllerInput.req['authUser']?._id as string);
  controllerInput.res.cookie('papp_starter_refresh', refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });
  controllerInput.res.json({
    ...controllerInput.req['authUser'],
    access_token: accessToken,
    refresh_token: refreshToken,
  });
};
