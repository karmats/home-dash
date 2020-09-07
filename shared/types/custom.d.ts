declare module 'express-request-id';
declare namespace Express {
  export interface Request {
    id: string;
  }
}
