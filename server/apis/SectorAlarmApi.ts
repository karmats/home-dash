import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import config from '../config';
import { Temperature } from '../../shared/types';

const BASE_URL = 'https://mypagesapi.sectoralarm.net';
const REQUEST_VERIFICATON_TOKEN_NAME = '__RequestVerificationToken';
const COOKIE_JAR_PATH = 'sa-cookie.json';

type SectorAlarmMeta = {
  version: string;
  cookie: string;
};

/**
 * Authenticates to Sector alarm. Saves the version and cookie to file
 */
export const authenticate = async (): Promise<SectorAlarmMeta> => {
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

          if (token) {
            const formdata = new FormData();
            const { username, password } = config.sectoralarm.auth;
            formdata.append('userID', username);
            formdata.append('password', password);
            formdata.append(REQUEST_VERIFICATON_TOKEN_NAME, token);
            formdata.submit(`${BASE_URL}/User/Login`, (err, response) => {
              if (err) {
                reject(err);
              } else if (response.statusCode !== 302) {
                reject(`Expected 302 response code, instead got ${response.statusCode}.`);
              } else {
                const setCookieHeader = response.headers['set-cookie'];
                if (setCookieHeader && setCookieHeader.length) {
                  const sessionMeta = {
                    cookie: setCookieHeader[0],
                    version: meta.version
                  };
                  // Save cookie to file so login isn't necessary every time
                  fs.writeFile(COOKIE_JAR_PATH, JSON.stringify(sessionMeta), err => {
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
    fs.readFile(COOKIE_JAR_PATH, { encoding: 'UTF-8' }, (err, cookie) => {
      if (err || !cookie) {
        resolve(authenticate());
      } else {
        const meta: SectorAlarmMeta = JSON.parse(cookie);
        // Check that the cookie hasn't expired. If it has, re-authenticate
        fetch(`${BASE_URL}/User/GetUserInfo`, { method: 'HEAD' })
          .then(response => (response.status === 200 ? resolve(meta) : resolve(authenticate())))
          .catch(e => {
            console.error(`Got error "${JSON.stringify(e)}", trying to reconnect`);
            resolve(authenticate());
          });
      }
    });
  });
};

/**
 * Get temperatures from sensors in the house
 */
export const getTemperatures = async (): Promise<Temperature[]> => {
  return getSessionMeta().then(async sessionMeta => {
    return fetch(`${BASE_URL}/Panel/GetTempratures`, {
      method: 'POST',
      body: JSON.stringify({ id: config.sectoralarm.deviceId, Version: sessionMeta.version }),
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
        Cookie: sessionMeta.cookie
      }
    })
      .then(response => response.json())
      .then(json =>
        json.map((j: any) => ({
          location: j.Label,
          value: +j.Temprature,
          scale: 'C'
        }))
      );
  });
};
