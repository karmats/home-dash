import fs from 'fs';
import { google } from 'googleapis';
import credentials from './credentials';
import { CalendarEvent } from '../../../../shared/types';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
export const getCalendarEvents = (from: Date, to: Date): Promise<ReadonlyArray<CalendarEvent>> => {
  return new Promise((resolve, reject) => {
    authorize(credentials, (auth: any) =>
      listEvents(auth, from, to).then(
        res => resolve(res),
        err => reject(err)
      )
    );
  });
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials: any, callback: any) {
  console.log('Authorizing', credentials);
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, { encoding: 'UTF-8' }, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client: any, callback: any) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url:', authUrl);

  oAuth2Client.getToken('xxx', (err: any, token: any) => {
    if (err) return console.error('Error retrieving access token', err);
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
      if (err) return console.error(err);
      console.log('Token stored to', TOKEN_PATH);
    });
    callback(oAuth2Client);
  });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth: any, from: Date, to: Date): Promise<ReadonlyArray<CalendarEvent>> {
  return new Promise((resolve, reject) => {
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list(
      {
        calendarId: 'primary',
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      },
      (err, res) => {
        if (err) {
          reject('The API returned an error: ' + err);
        }
        const events = res?.data?.items;
        if (events && events.length) {
          resolve(
            events.map(event => {
              const start = event?.start?.dateTime || event?.start?.date;
              const end = event?.end?.dateTime || event?.end?.date;
              console.log(`${start} - ${event.summary}`);
              return {
                from: new Date(start!),
                to: new Date(end!),
                summary: event.summary!
              };
            })
          );
        } else {
          resolve([]);
        }
      }
    );
  });
}
