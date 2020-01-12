import express from 'express';
import { WeatherController } from './modules/Weather';
import { CalendarController } from './modules/Calendar';
import { GoogleAuthenticationController } from './modules/Authentication';

const hostname = '127.0.0.1';
const port = 4000;

const app = express();

app.get('/', function(_, res) {
  res.send('App is up and running');
});
app.get('/weather', WeatherController.getForecastsFromRequest);
app.get('/calendar', CalendarController.getCalendarEventsFromRequest);
app.get('/auth/google', GoogleAuthenticationController.authenticateToGoogle);

app.listen(port, hostname, function() {
  console.log(`Server running at http://${hostname}:${port}/`);
});
