import { isConnected, getAuthenticationUrl } from '../../../../apis/GoogleApi';
import { authenticate } from '../../../../apis/SectorAlarmApi';
export default {
  isConnectedToGoogle: isConnected,
  getGoogleAuthenticationUrl: getAuthenticationUrl,
  authenticateToSectorAlarm: authenticate
};
