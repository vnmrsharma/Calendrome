const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    return null;
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});


    const cals = await (await calendar.calendarList.list()).data.items;
    var obj = {
        table: []
    };

    for (let i = 0; i < cals.length; i++) {
        if(cals[i].summary == 'Holidays in United States')
            continue;
        const repeating_event_data = await calendar.events.list({
            calendarId: cals[i].id,
            timeMin: new Date().toISOString(),
            maxResults: 250,
            singleEvents: true,
            orderBy: 'startTime',
            timeZone: 'America/New_York'
          });

        const event_array = repeating_event_data.data.items;
        event_array.map((event, i) => {
            //const start = event.start.dateTime || event.start.date;
           // console.log(`${start} - ${event.summary}`);
           
           
           
           if(event.start.dateTime === undefined)
           {
                //full
                var when_start = event.start.date;
                var d_start = new Date(when_start);
                var when_end = event.end.date;
                var d_end = new Date(when_end);
                obj.table.push({start_day:d_start.toLocaleDateString(), start_time: '00:00:00' , end_day: d_end.toLocaleDateString(), end_time: '23:59:00'});
                //console.log(`${d_start.toLocaleDateString()}-00:00:00  :   ${d_end.toLocaleDateString()}-11:59:00`);
            
           }
            else if(event.start.date == undefined)
            {
                //part day event
                var when_start = event.start.dateTime;
                var d_start = new Date(when_start);
                var when_end = event.end.dateTime;
                var d_end = new Date(when_end);
                obj.table.push({start_day:d_start.toLocaleDateString(), start_time: d_start.toLocaleTimeString('en-US',{ hour12: false }) , end_day: d_end.toLocaleDateString(), end_time: d_end.toLocaleTimeString('en-US',{ hour12: false })});

                //console.log(`${d_start.toLocaleDateString()}-${d_start.toLocaleTimeString('en-US',{ hour12: false })}  :   ${d_end.toLocaleDateString()}-${d_end.toLocaleTimeString('en-US',{ hour12: false })}`);
            } 
            
            
            
           //console.log(`${d.toLocaleTimeString('en-US',{ hour12: false })}-${event.start.date}-${event.summary}`);
            //console.log(`${event.start.dateTime || event.start.date}-${event.summary}`);

        })
      }
      var json = JSON.stringify(obj);
    
        fs.writeFile('myjsonfile.json', json, 'utf8', (err) => {
            if (err)
              console.log(err);
            else {
              console.log("File written successfully\n");
              
            }
          });
   // console.log(cals[0].summary);

 // console.log(cals.length);

 /*
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: false,
    //orderBy: 'startTime',
  });


  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }
  console.log('Upcoming 10 events:');
  events.map((event, i) => {
    const start = event.start.dateTime || event.start.date;
    console.log(`${start} - ${event.summary}`);
  });
  */
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxe4U279Zmimr4qBD5myQ5odY134heVhU",
  authDomain: "hopperhacks2023-377521.firebaseapp.com",
  projectId: "hopperhacks2023-377521",
  storageBucket: "hopperhacks2023-377521.appspot.com",
  messagingSenderId: "182687176020",
  appId: "1:182687176020:web:48defe6c98549006da64c1",
  measurementId: "G-J2HYFJ3P35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


authorize().then(listEvents).catch(console.error);