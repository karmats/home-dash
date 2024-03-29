import FormData from 'form-data';
import fs from 'fs';
import config from '../config';
import { Temperature, HomeAlarmInfo, ArmedStatus } from '../../shared/types';
import { getLogger } from '../logger';

const logger = getLogger('SectorAlarmApi');
const BASE_URL = 'https://mypagesapi.sectoralarm.net';
const REQUEST_VERIFICATON_TOKEN_NAME = '__RequestVerificationToken';
const SESSION_META_PATH = 'sa-meta.json';

type SectorAlarmInfo = {
  ArmedStatus: string;
  IsOnline: boolean;
  PanelTime: string;
};
type SectorAlarmTemperature = {
  Label: string;
  Temprature: string;
};
type SectorAlarmMeta = {
  version: string;
  cookie: string;
};

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

const headers = (cookie: string) => ({
  Accept: 'application/json',
  'Content-type': 'application/json',
  Cookie: cookie,
});

/**
 * Authenticates to Sector alarm. Saves the version and cookie to file
 */
export const authenticateSectorAlarm = async (): Promise<SectorAlarmMeta> => {
  logger.debug('Authenticating to sector alarm');
  return fetch(`${BASE_URL}/User/Login`, { method: 'GET' }).then(response => {
    return new Promise<SectorAlarmMeta>(async (resolve, reject) => {
      let content = await response.text();
      if (content) {
        const versionRegex = /<script src="\/Scripts\/main.js\?(v.*)"/g;
        const cookie = response.headers.get('set-cookie');
        const versionResult = versionRegex.exec(content);
        const version = versionResult ? versionResult[1] : null;
        if (version && cookie) {
          resolve({ cookie, version });
        } else {
          reject('Failed to retrieve session meta.');
        }
        // });
      } else {
        reject('Response did not have a text');
      }
    }).then(
      meta =>
        new Promise((resolve, reject) => {
          const verficationToken = meta.cookie.split(';').find(c => c.startsWith(REQUEST_VERIFICATON_TOKEN_NAME));
          const token = verficationToken && verficationToken.split('=')[1];

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
                  const sessionMeta = {
                    cookie: setCookieHeader[0],
                    version: meta.version,
                  };
                  logger.debug('Authenticated to sector alarm, saving meta.');
                  fs.writeFile(SESSION_META_PATH, JSON.stringify(sessionMeta), err => {
                    if (err) {
                      throw new Error(`Failed to write file: ${JSON.stringify(err)}`);
                    }
                  });
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
    fs.readFile(SESSION_META_PATH, { encoding: 'utf-8' }, (err, meta) => {
      if (err || !meta) {
        logger.info('No session meta file found, authenticating');
        resolve(authenticateSectorAlarm());
      } else {
        const sessionMeta: SectorAlarmMeta = JSON.parse(meta);
        // Check that the cookie hasn't expired. If it has, re-authenticate
        fetch(`${BASE_URL}/User/GetUserInfo`, {
          method: 'GET',
          headers: headers(sessionMeta.cookie),
        })
          .then(response => {
            if (response.status === 200) {
              logger.debug('Session still valid, reusing cookie');
              resolve(sessionMeta);
            } else {
              logger.debug('Session not valid, reauthenticating');
              resolve(authenticateSectorAlarm());
            }
          })
          .catch(e => {
            logger.error(`Got error, trying to reconnect: ${JSON.stringify(e)}`);
            resolve(authenticateSectorAlarm());
          });
      }
    });
  });
};

/**
 * Get house alarm status. If there are more than one alarm registered only the first will be returned.
 */
export const getAlarmStatus = async (): Promise<HomeAlarmInfo> => {
  return getSessionMeta().then(meta => {
    return fetch(`${BASE_URL}/Panel/GetPanelList`, {
      headers: headers(meta.cookie),
    })
      .then(response => response.json() as Promise<SectorAlarmInfo[]>)
      .then(json => {
        if (json && json.length) {
          const info = json
            .map(j => ({
              status: armedStatusToAlarmStatus(j.ArmedStatus),
              online: j.IsOnline,
              time: sectorAlarmDateToMs(j.PanelTime),
            }))
            .pop() as HomeAlarmInfo;
          logger.debug(`Got alarm info status '${info?.status}'`);
          return info;
        } else {
          const error = 'Expected at least one alarm, got zero';
          logger.error(error);
          throw new Error(error);
        }
      })
      .catch(e => {
        logger.error(`Get alarm status failed: "${e.toString()}"`);
        throw e;
      });
  });
};

/**
 * Get temperatures from sensors in the house
 */
export const getTemperatures = async (): Promise<Temperature[]> => {
  return getSessionMeta().then(meta => {
    return fetch(`${BASE_URL}/Panel/GetTempratures`, {
      method: 'POST',
      body: JSON.stringify({ id: config.sectoralarm.deviceId, Version: meta.version }),
      headers: headers(meta.cookie),
    })
      .then(response => response.json() as Promise<SectorAlarmTemperature[]>)
      .then(json => {
        if (json && json.length) {
          return json.map(
            j =>
              ({
                location: j.Label,
                value: +j.Temprature,
                scale: 'C',
              } as Temperature)
          );
        } else {
          const error = `Failed to retrieve temparatures got response '${JSON.stringify(json)}'`;
          logger.error(error);
          throw new Error(error);
        }
      })
      .catch(e => {
        logger.error(`Get temperatures failed: "${e.toString()}"`);
        throw e;
      });
  });
};

/** Toggle alarm. If alarm is off, partial alarm is set. If alarm is set to full, nothing is done. Otherwise the alarm turns off */
export const toggleAlarm = async (): Promise<HomeAlarmInfo> => {
  return getAlarmStatus().then(async info => {
    if (info.status === 'full') {
      return info;
    }
    const armCmd = info.status === 'off' ? 'Partial' : 'Disarm';
    return getSessionMeta().then(async meta => {
      return fetch(`${BASE_URL}/Panel/ArmPanel`, {
        method: 'POST',
        body: JSON.stringify({
          ArmCmd: armCmd,
          PanelCode: config.sectoralarm.pin,
          HasLocks: false,
          id: config.sectoralarm.deviceId,
        }),
        headers: headers(meta.cookie),
      })
        .then(response => response.json() as Promise<{ panelData: SectorAlarmInfo }>)
        .then(json => ({
          status: armedStatusToAlarmStatus(json.panelData.ArmedStatus),
          online: json.panelData.IsOnline,
          time: sectorAlarmDateToMs(json.panelData.PanelTime),
        }));
    });
  });
};
