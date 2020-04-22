export default {
  google: {
    auth: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    },
  },
  sectoralarm: {
    auth: {
      username: process.env.SA_USERNAME,
      password: process.env.SA_PASSWORD,
    },
    deviceId: process.env.SA_DEVICE_ID,
  },
};
