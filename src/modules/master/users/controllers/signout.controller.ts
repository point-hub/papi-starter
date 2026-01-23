import { type IController, type IControllerInput } from '@point-hub/papi';

export const signoutController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Commit transaction and send response
    await session.commitTransaction();
    controllerInput.res.status(200);
    controllerInput.res.cookie('papp_starter_access', '', {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      expires: new Date(0),
    });
    controllerInput.res.cookie('papp_starter_refresh', '', {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      expires: new Date(0),
    });
    controllerInput.res.json();
  } catch (error) {
    await session?.abortTransaction();
    throw error;
  } finally {
    await session?.endSession();
  }
};
