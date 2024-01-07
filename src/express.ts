import { IHttpRequest, IMakeControllerInput } from '@point-hub/papi'
import { NextFunction, Request, Response } from 'express'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeController = async (makeControllerInput: IMakeControllerInput) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (req: Request, res: Response, next: NextFunction) => {
    const httpRequest: IHttpRequest = {
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      method: req.method,
      path: req.path,
      headers: {
        Accept: req.get('Accept'),
        Authorization: req.get('Authorization'),
        'Content-Type': req.get('Content-Type'),
        'User-Agent': req.get('User-Agent'),
      },
    }

    try {
      const response = await makeControllerInput.controller({
        httpRequest,
        dbConnection: makeControllerInput.dbConnection,
      })
      res.status(response.status)
      if (response.json) {
        res.json(response.json)
      }
    } catch (error) {
      next(error)
    }
  }
}
