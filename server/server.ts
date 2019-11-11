import express from 'express';
import { WeatherController } from './modules/Weather';

const hostname = '127.0.0.1';
const port = 4000;

const app = express();

app.get('/', function(req, res) {
  res.send('App is up and running');
});
app.get('/weather', WeatherController.getForecastsFromRequest);

app.listen(port, hostname, function() {
  console.log(`Server running at http://${hostname}:${port}/`);
});
