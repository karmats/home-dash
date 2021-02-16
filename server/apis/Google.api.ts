import fs from 'fs';
import { google } from 'googleapis';
import config from '../config';
import { CalendarEvent } from '../../shared/types';
import { getLogger } from '../logger';

type CalendarFromToRequest = {
  from: Date;
  to: Date;
};
type CalendarCommingRequest = { next: number };
type CalendarEventRequest = CalendarFromToRequest | CalendarCommingRequest;

const logger = getLogger('GoogleApi');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'google-token.json';

const oAuth2Client = new google.auth.OAuth2(
  config.google.auth.clientId,
  config.google.auth.clientSecret,
  config.google.auth.redirectUri
);

// Load client secrets from a local file.
export const getCalendarEvents = (request: CalendarEventRequest): Promise<ReadonlyArray<CalendarEvent>> => {
  return getAuthToken().then(token => {
    oAuth2Client.setCredentials(token);
    return listEvents(request);
  });
};

/**
 * Check if application is connected to google
 */
export const isConnected = async (): Promise<boolean> => {
  return getAuthToken()
    .then(async token => {
      oAuth2Client.setCredentials(token);
      return google
        .calendar({ version: 'v3', auth: oAuth2Client })
        .calendarList.list()
        .then(() => {
          logger.debug('Authenticated to Google!');
          return true;
        })
        .catch(e => {
          logger.info('Not authenticated:');
          logger.error(e);
          return false;
        });
    })
    .catch(() => false);
};

/**
 * Generate a google login url
 */
export const getAuthenticationUrl = () => {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 */
export const authenticateGoogle = (code: string) => {
  oAuth2Client.getToken(code).then(response => {
    oAuth2Client.setCredentials(response.tokens);
    logger.debug('Authenticated to google, saving file');
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
    fs.readFile(TOKEN_PATH, { encoding: 'utf-8' }, (err, token) => {
      if (err || !token) {
        reject(`Failed to read token file: ${JSON.stringify(err)}`);
      } else {
        resolve(JSON.parse(token));
      }
    });
  });
};

const isCommingRequest = (request: CalendarEventRequest): request is CalendarCommingRequest =>
  Object.keys(request).indexOf('next') >= 0;

/**
 * Lists events on the user's calendar.
 *
 * @param request The CalendarEventRequest, either a from/to or comming x events
 */
const listEvents = async (request: CalendarEventRequest): Promise<ReadonlyArray<CalendarEvent>> => {
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  const eventRequest = {
    calendarId: config.google.calendar.id,
    singleEvents: true,
    timeMin: new Date().toISOString(),
    orderBy: 'startTime',
  };
  logger.debug(`Sending event request ${JSON.stringify(eventRequest)}`);
  return calendar.events
    .list(
      isCommingRequest(request)
        ? { ...eventRequest, maxResults: request.next }
        : { ...eventRequest, timeMin: request.from.toISOString(), timeMax: request.to.toISOString() }
    )
    .then(res => {
      const events = res?.data?.items;
      if (events && events.length) {
        logger.debug(`Got ${events.length} calendar events.`);
        return events.map(event => {
          return {
            from: { date: event?.start?.date, dateTime: event?.start?.dateTime },
            to: { date: event?.end?.date, dateTime: event?.end?.dateTime },
            summary: event.summary || '',
          };
        });
      }
      return [];
    });
};
