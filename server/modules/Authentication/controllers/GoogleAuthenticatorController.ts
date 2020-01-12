import express from 'express';
import { authenticate } from '../../../apis/GoogleApi';

const authenticateToGoogle = (req: express.Request, res: express.Response) => {
  const { code } = req.query;
  authenticate(code);
  res.redirect('/');
  res.end();
};

export default { authenticateToGoogle };
