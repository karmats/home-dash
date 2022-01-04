import './env';
import express from 'express';
import addRequestId from 'express-request-id';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { GoogleAuthenticatorController, SectorAlarmAuthenticationController } from './modules/Authentication';
import { WeatherController } from './modules/Weather';
import { CalendarController } from './modules/Calendar';
import { TemperatureController } from './modules/Temperature';
import { HomeAlarmController } from './modules/HomeAlarm';
import { NewsController } from './modules/News';
import { getLogger } from './logger';

const logger = getLogger('server');
const app = express();

app.use(addRequestId());

app.get('/', function (_, res) {
  res.send('App is up and running');
});
app.get('/weather', WeatherController.getForecastsFromRequest);
app.get('/calendar', CalendarController.getCalendarEventsFromRequest);
app.get('/news', NewsController.getLatestNews);
app.get('/temperatures/indoor', TemperatureController.getIndoorTemperatures);
app.get('/homealarm/status', HomeAlarmController.getHomeAlarmStatusInfo);
app.post('/homealarm/toggle', HomeAlarmController.toggleAlarm);
app.get('/auth/google', GoogleAuthenticatorController.authenticateToGoogle);
app.get('/auth/sectoralarm', SectorAlarmAuthenticationController.authenticateToSectorAlarm);

// Http
const hostname = '0.0.0.0';
const port = 4000;
http.createServer(app).listen(port, hostname, () => {
  logger.info(`Server running at http://${hostname}:${port}`);
});

// Https
const portSsl = 4001;
let key: Buffer | null = null;
let cert: Buffer | null = null;
try {
  key = fs.readFileSync(`${__dirname}/../key.pem`);
  cert = fs.readFileSync(`${__dirname}/../certificate.pem`);
} catch (e) {
  logger.info(`Couldn't find https certificates, starting http server only: ${JSON.stringify(e)}`);
}

if (key && cert) {
  https.createServer({ key, cert }, app).listen(portSsl, hostname, () => {
    logger.info(`Server running at https://${hostname}:${portSsl}`);
  });
}
