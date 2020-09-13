import * as fs from 'fs';
import { config } from 'dotenv';
import { getLogger } from './logger';

const logger = getLogger('env');

const dotenvPath = `${__dirname}/../.env`;
let path = '';
if (fs.existsSync(`${dotenvPath}.local`)) {
  path = `${dotenvPath}.local`;
} else if (fs.existsSync(dotenvPath)) {
  path = dotenvPath;
}

if (path) {
  const conf = config({
    path,
  });
  logger.debug(`Starting with config from path ${path}:  ${JSON.stringify(conf)}`);
} else {
  throw new Error('Provide a ".env" or ".env.local" file in the root of the project to run the application');
}
