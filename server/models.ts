import { Request } from 'express';

export type ExpressRequest<Params = unknown> = Request<{ [key: string]: string }, unknown, unknown, Params> & {
  id: string;
};
