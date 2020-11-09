import './env';
import express from 'express';
import addRequestId from 'express-request-id';
import { GoogleAuthenticatorController, SectorAlarmAuthenticationController } from './modules/Authentication';
import { WeatherController } from './modules/Weather';
import { CalendarController } from './modules/Calendar';
import { TemperatureController } from './modules/Temperature';
import { HomeAlarmController } from './modules/HomeAlarm';
import { getLogger } from './logger';

const hostname = '0.0.0.0';
const port = 4000;

const logger = getLogger('server');
const app = express();

app.use(addRequestId());

app.get('/', function (_, res) {
  res.send('App is up and running');
});
app.get('/weather', WeatherController.getForecastsFromRequest);
app.get('/calendar', CalendarController.getCalendarEventsFromRequest);
app.get('/temperatures/indoor', TemperatureController.getIndoorTemperatures);
app.get('/homealarm/status', HomeAlarmController.getHomeAlarmStatusInfo);
app.post('/homealarm/toggle', HomeAlarmController.toggleAlarm);
app.get('/auth/google', GoogleAuthenticatorController.authenticateToGoogle);
app.get('/auth/sectoralarm', SectorAlarmAuthenticationController.authenticateToSectorAlarm);

app.listen(port, hostname, function () {
  logger.info(`Server running at http://${hostname}:${port}/`);
});
