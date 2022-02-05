import express from 'express';
import { authenticateGoogle } from '../../apis';

const authenticateToGoogle = (req: express.Request, res: express.Response) => {
  const { code } = req.query;
  authenticateGoogle(code as string);
  res.redirect('/');
  res.end();
};

export default { authenticateToGoogle };
