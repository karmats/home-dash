import * as fs from 'fs';
import { config } from 'dotenv';

const dotenvPath = `${__dirname}/../.env`;

if (fs.existsSync(`${dotenvPath}.local`)) {
  config({
    path: `${dotenvPath}.local`,
  });
} else if (fs.existsSync(dotenvPath)) {
  config({
    path: dotenvPath,
  });
} else {
  throw new Error('Provide a ".env" or ".env.local" file in the root of the project to run the application');
}
