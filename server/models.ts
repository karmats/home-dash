import { Request } from 'express';

export type ExpressRequest<Params = {}> = Request<{ [key: string]: string }, any, any, Params> & { id: string };
