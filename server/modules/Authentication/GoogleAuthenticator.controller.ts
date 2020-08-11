import express from 'express';
import { authenticateGoogle } from '../../apis';
import { ExpressRequest } from '../../models';

const authenticateToGoogle = (req: ExpressRequest<{ code: string }>, res: express.Response) => {
  const { code } = req.query;
  authenticateGoogle(code);
  res.redirect('/');
  res.end();
};

export default { authenticateToGoogle };
