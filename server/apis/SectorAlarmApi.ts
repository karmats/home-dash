import fetch from 'node-fetch';
import FormData from 'form-data';
import config from '../config';
import { Temperature, HomeAlarmInfo, ArmedStatus } from '../../shared/types';
import { getLogger } from '../logger';

const logger = getLogger('SectorAlarmApi');
const BASE_URL = 'https://mypagesapi.sectoralarm.net';
const REQUEST_VERIFICATON_TOKEN_NAME = '__RequestVerificationToken';

type SectorAlarmMeta = {
  version: string;
  cookie: string;
};

let sessionMeta: SectorAlarmMeta;

const armedStatusToAlarmStatus = (armedStatus: string): ArmedStatus => {
  switch (armedStatus) {
    case 'armed':
      return 'full';
    case 'partialarmed':
      return 'partial';
    case 'disarmed':
      return 'off';
    default:
      return 'unknown';
  }
};

const sectorAlarmDateToMs = (date: string): number => {
  const ms = /\/Date\((-?\d*)\)\//.exec(date);
  return ms && ms[1] ? +ms[1] : -1;
};

/**
 * Authenticates to Sector alarm. Saves the version and cookie to file
 */
export const authenticate = async (): Promise<SectorAlarmMeta> => {
  logger.debug('Authenticating to sector alarm');
  return fetch(`${BASE_URL}/User/Login`).then(response => {
    return new Promise<SectorAlarmMeta>((resolve, reject) => {
      let content = '';
      response.body.on('data', data => {
        content += data;
      });
      response.body.on('end', () => {
        const versionRegex = /<script src="\/Scripts\/main.js\?(v\d*_\d*_\d*)"/g;
        const cookie = response.headers.get('set-cookie');
        const versionResult = versionRegex.exec(content);
        const version = versionResult ? versionResult[1] : null;
        if (version && cookie) {
          resolve({ cookie, version });
        } else {
          reject('Failed to retrieve session meta.');
        }
      });
    }).then(
      meta =>
        new Promise((resolve, reject) => {
          const verficationToken = meta.cookie.split(';').find(c => c.startsWith(REQUEST_VERIFICATON_TOKEN_NAME));
          const token = verficationToken && verficationToken.split('=')[1];
          logger.debug(`Got token ${token}`);

          if (token) {
            const formdata = new FormData();
            const { username, password } = config.sectoralarm.auth;
            formdata.append('userID', username);
            formdata.append('password', password);
            formdata.append(REQUEST_VERIFICATON_TOKEN_NAME, token);
            logger.debug(`Signing in as '${username}'`);
            formdata.submit(`${BASE_URL}/User/Login`, (err, response) => {
              if (err) {
                logger.error(`Error from sector alarm login: ${JSON.stringify(err)}`);
                reject(err);
              } else if (response.statusCode !== 302) {
                const msg = `Expected 302 response code, instead got ${response.statusCode}.`;
                logger.error(msg);
                reject(msg);
              } else {
                const setCookieHeader = response.headers['set-cookie'];
                if (setCookieHeader && setCookieHeader.length) {
                  sessionMeta = {
                    cookie: setCookieHeader[0],
                    version: meta.version,
                  };
                  resolve(sessionMeta);
                } else {
                  reject(`Expected set-cookie header to be defined, ${setCookieHeader}`);
                }
              }
            });
          } else {
            logger.error(`No token from cookie with version ${meta.version}`);
            reject(`Failed to retrieve token from cookie ${JSON.stringify(meta)}`);
          }
        })
    );
  });
};

/**
 * Get cookie and version for calls to api
 */
const getSessionMeta = (): Promise<SectorAlarmMeta> => {
  return new Promise(resolve => {
    if (!sessionMeta) {
      resolve(authenticate());
    } else {
      logger.debug(`Trying to authenticate to sector alarm with version '${sessionMeta.version}'`);
      // Check that the cookie hasn't expired. If it has, re-authenticate
      fetch(`${BASE_URL}/User/GetUserInfo`, { method: 'HEAD' })
        .then(response => (response.status === 200 ? resolve(sessionMeta) : resolve(authenticate())))
        .catch(e => {
          logger.error(`Got error, trying to reconnect: ${JSON.stringify(e)}`);
          resolve(authenticate());
        });
    }
  });
};

/**
 * Get house alarm status. If there are more than one alarm registered only the first will be returned.
 */
export const getAlarmStatus = async (): Promise<HomeAlarmInfo> => {
  return getSessionMeta().then(async meta => {
    return fetch(`${BASE_URL}/Panel/GetPanelList`, {
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
        Cookie: meta.cookie,
      },
    })
      .then(response => response.json())
      .then(json => {
        if (json.length) {
          return json
            .map((j: any) => ({
              status: armedStatusToAlarmStatus(j.ArmedStatus),
              online: j.IsOnline,
              time: sectorAlarmDateToMs(j.PanelTime),
            }))
            .pop();
        } else {
          throw new Error('Expected at least one alarm, got zero');
        }
      });
  });
};

/**
 * Get temperatures from sensors in the house
 */
export const getTemperatures = async (): Promise<Temperature[]> => {
  return getSessionMeta().then(async meta => {
    return fetch(`${BASE_URL}/Panel/GetTempratures`, {
      method: 'POST',
      body: JSON.stringify({ id: config.sectoralarm.deviceId, Version: meta.version }),
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
        Cookie: meta.cookie,
      },
    })
      .then(response => response.json())
      .then(json => {
        return json.map((j: any) => ({
          location: j.Label,
          value: +j.Temprature,
          scale: 'C',
        }));
      });
  });
};
