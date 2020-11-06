export default {
  google: {
    auth: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    },
    calendar: {
      id: process.env.GOOGLE_CALENDAR_ID,
    },
  },
  sectoralarm: {
    auth: {
      username: process.env.SA_USERNAME,
      password: process.env.SA_PASSWORD,
    },
    pin: process.env.SA_PIN,
    deviceId: process.env.SA_DEVICE_ID,
  },
  user: {
    location: process.env.USER_LOCATION,
  },
};
