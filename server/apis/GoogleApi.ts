import fs from 'fs';
import { google } from 'googleapis';
import config from '../config';
import { CalendarEvent } from '../../shared/types';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const oAuth2Client = new google.auth.OAuth2(
  config.google.auth.client_id,
  config.google.auth.client_secret,
  config.google.auth.redirect_uris[0]
);

// Load client secrets from a local file.
export const getCalendarEvents = (from: Date, to: Date): Promise<ReadonlyArray<CalendarEvent>> => {
  return getAuthToken().then(token => {
    oAuth2Client.setCredentials(token);
    return listEvents(from, to);
  });
};

/**
 * Check if application is connected to google
 */
export const isConnected = async () => {
  return getAuthToken()
    .then(async token => {
      oAuth2Client.setCredentials(token);
      return google
        .calendar({ version: 'v3', auth: oAuth2Client })
        .calendarList.list()
        .then(() => true)
        .catch(() => false);
    })
    .catch(() => false);
};

/**
 * Generate a google login url
 */
export const getAuthenticationUrl = () => {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 */
export const authenticate = (code: string) => {
  oAuth2Client.getToken(code).then(response => {
    oAuth2Client.setCredentials(response.tokens);
    // Store the token to disk for later program executions
    fs.writeFile(TOKEN_PATH, JSON.stringify(response.tokens), err => {
      if (err) {
        throw new Error(`Failed to write file: ${JSON.stringify(err)}`);
      }
    });
  });
};

/**
 * Get auth token stored on disc, if any
 */
const getAuthToken = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, { encoding: 'UTF-8' }, (err, token) => {
      if (err || !token) {
        reject(`Failed to read token file: ${JSON.stringify(err)}`);
      } else {
        resolve(JSON.parse(token));
      }
    });
  });
};

/**
 * Lists events on the user's calendar.
 *
 * @param from  From date
 * @param to    To Date
 */
const listEvents = async (from: Date, to: Date): Promise<ReadonlyArray<CalendarEvent>> => {
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  /*calendar.calendarList.list().then(calendars => {
      console.log(calendars.data);
    });*/
  return calendar.events
    .list({
      calendarId: 'primary',
      timeMin: from.toISOString(),
      timeMax: to.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    })
    .then(res => {
      const events = res?.data?.items;
      if (events && events.length) {
        return events.map(event => {
          const start = event?.start?.dateTime || event?.start?.date;
          const end = event?.end?.dateTime || event?.end?.date;
          return {
            from: new Date(start!),
            to: new Date(end!),
            summary: event.summary!
          };
        });
      }
      return [];
    });
};
