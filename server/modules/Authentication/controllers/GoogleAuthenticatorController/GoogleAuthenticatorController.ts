import express from 'express';
import { authenticate } from '../../../../apis/GoogleApi';
import { ExpressRequest } from '../../../../models';

const authenticateToGoogle = (req: ExpressRequest<{ code: string }>, res: express.Response) => {
  const { code } = req.query;
  authenticate(code);
  res.redirect('/');
  res.end();
};

export default { authenticateToGoogle };
