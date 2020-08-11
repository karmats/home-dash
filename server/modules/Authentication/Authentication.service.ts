import { isConnected, getAuthenticationUrl, authenticateSectorAlarm } from '../../apis/';
export default {
  isConnectedToGoogle: isConnected,
  getGoogleAuthenticationUrl: getAuthenticationUrl,
  authenticateToSectorAlarm: authenticateSectorAlarm,
};
