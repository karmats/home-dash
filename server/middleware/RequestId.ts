import { guid } from '../utils';
import type { Request, Response, NextFunction, RequestHandler } from 'express';

const HEADER_NAME = 'X-Request-Id';

export const requestID = (): RequestHandler => {
  return (request: Request, response: Response, next: NextFunction): void => {
    const oldValue = request.get(HEADER_NAME);
    const id = oldValue === undefined ? guid() : oldValue;

    response.set(HEADER_NAME, id);

    request['id'] = id;

    next();
  };
};
