# Home Dashboard [![Build](https://github.com/karmats/home-dash/actions/workflows/nodejs.yml/badge.svg)](https://github.com/karmats/home-dash/actions/workflows/nodejs.yml)

![Example](/public/example/application-screenshot.png 'Dashboard example')

## Available Widgets

List of all different widgets currently available:

### Weather

Shows todays weather. Data retrieved from SMHI (Swedish Meteorological and Hydrological Institute).

### Calendar

Calendar showing your next 20 events retrieved from your google calendar.

### Temperature

Temperatures retrived from your sector alarm sensors.

### Home alarm status

Status for your house sector alarm. Activates partial alarm when touching the house.

### News (WIP)

Latest news retrieved from Dagens Nyheter.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode. Both client and server.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run server`

Starts the node server only on port 4000.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.
There are also build scripts to only build server or client, `npm run build:server` and `npm run build:client`.

## Configuration

To run the application you will need a [`.env`](https://github.com/motdotla/dotenv#readme)-file with the following properties

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://<app_server_deploy_location>:4000/auth/google
GOOGLE_CALENDAR_ID=your_google_calendar_id

SA_USERNAME=your_sector_alarm_username
SA_PASSWORD=your_sector_alarm_password
SA_DEVICE_ID=your_sector_alarm_device_id
SA_PIN=your_sector_alarm_pin_code(if you want partial alarm activatation)

USER_LOCATION=your_weather_location(lat,lon)
```

### SSL

To enable SSL, put `certificate.pem` and `key.pem` in the root-folder (along with the `.env`-file). On start the ssl-server will listen on port 4001.
