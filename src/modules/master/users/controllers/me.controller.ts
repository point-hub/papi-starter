import { type IController, type IControllerInput } from '@point-hub/papi';

export const meController: IController = async (controllerInput: IControllerInput) => {
  controllerInput.res.status(200);
  controllerInput.res.json(controllerInput.req['authUser']);
};
