// NodeJS
// npm install jsdom, jquery, twitter, sleep

// script runs every 10 seconds
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );

// load from env file
var Twitter = require('twitter'); // import Twitter npm module

// pull keys from environment (pfv=pulled from environment)
// can't store these in plaintext
var consumer_key = process.env.consumer_key_pfv;
var consumer_secret = process.env.consumer_secret_pfv;
var access_token_key = process.env.access_token_key_pfv;
var access_token_secret = process.env.access_token_secret_pfv;
var nypd_app_token = process.env.nypd_app_token_pfv;

// create twitter auth object
var client = new Twitter({
  consumer_key: consumer_key,
  consumer_secret: consumer_secret,
  access_token_key: access_token_key,
  access_token_secret: access_token_secret
});

// pull NYPD API info w/ jQuery
function returnAjax() {
  return $.ajax({  // return needed here to prevent null return
      url: "https://data.cityofnewyork.us/resource/fjn5-bxwg.json?incident_zip=10458",  // zip query specified in url
      type: "GET",
      async: false,  // Prevent heap overflow
      cache: false,  // Save resources
      dataType: "json",
      data: {"$limit": 50, "$$app_token": nypd_app_token}  // limit = number of entries, app_token = prevent throttling and give unlimited requests
   }).done(function(data) { return data; });
}

// Returns promise, will need to make the main while-loop async as well
// Do this in order for api call to finish before next while loop
function sendTweets(final_tweet) {
  return new Promise ((resolve, reject) => {
    client.post('statuses/update', final_tweet, function(error, tweet, response) {
      if (error) {
        reject(error);
        console.log("\x1b[31mError - Did not send: \x1b[0m" + final_tweet.status)  // Red text
      }
      resolve(response);
      console.log("\x1b[32mSuccessfully sent: \x1b[0m" + final_tweet.status)  // Green text
    });
  });
}

// create AM/PM time return function
function timeConverter(time) {
  var newTime = time.slice(11,16);
  if (parseInt(newTime.slice(0,2)) < 12) {
    if (newTime[0] == "0" && newTime[1] == "0") { // if 00 for midnight, convert to 12:00
      return ("12:" + newTime.slice(3,5).concat(" AM")).toString();
    }
    if (newTime[0] == "0") {
      return (newTime.slice(1,5).concat(" AM")).toString(); // AM Time, everything before 12
    }
    else {
      return (newTime.concat(" AM")).toString(); // 10 and 11, no 0 in front
    }
  } else {
      return (parseInt(newTime.slice(0,2) - 12).toString()).concat(newTime.slice(2,5), " PM"); // PM time is during or after 12
  }
}

// sleep function for while loop (sleep nodejs import)
var sleep = require('sleep');

// store outside of while-loop, almost like a global var
// don't want to re-initlialize in while-loop everytime
var visitedReports = []; // store already posted reports, do this to prevent dups on twitter

var trackNumber = 0; // Used to number logs

console.log("");  // New line after terminal prompt

// Async needed for while loop so sendTweets() has enough time and is not passed for not being immediate
(async () => {
  // keep running indefinitely, server style
  while (1) {
    // 17 is the magic number here, Ajax full report, want 17th item anyways
    var data = returnAjax(); // pull NYPD SOCRATA API Report json

    // Create 2 days ago's date (API is not live and must be lagged a 2 days behind)
    // single digit months automatically padded with a 0
    var today = new Date((new Date()).valueOf() - 1000*60*60*24*2);
    var today_date = today.toISOString().substring(0, 10);
    today_date = today_date.slice(0,4) + "-" + today_date.slice(5,7) + "-" + today_date.slice(8,10); // yyyy-mm-dd (NYPD API date format)
    // match formatting of API dates, create today_date so we can still use time

    // following code block used to prevent dupes in using a visited queue
    // once 12:00AM comes around, queue removes data points from the day before and starts fresh
    var infoStore = []; // store current reports

    // need to index info before adding to infoStore
    var beforeStore = [];

    // index beforeStore
    for (var key of Object.keys(data)) {
        beforeStore.push(data[key]);  // push reports to info store
    }

    var currentTime = '';  // init current time
    currentTime = currentTime.concat(String(today.getHours()), String(today.getMinutes()), String(today.getSeconds())); // hours:minutes:seconds to string

    // get yesterday's date to clear out yesterday's data for next day's queue
    if (currentTime.slice(0,2) == "23" && currentTime.slice(2,4) == "59" && "30" <= currentTime.slice(4,6) >= "59") {
      var yesterday = today_date; // get date just before next day
    }

    // At 12:00AM of next day, remove visited reports from yesterday
    if (currentTime.slice(0,2) == "00" && currentTime.slice(2,4) == "00" && "00" <= currentTime.slice(4,6) >= "30") { // 15 second grace period
      // empty visited queue of visited reports
      for (var i = 0; i < visitedReports.length; i++) {
        if (visitedReports[i].created_date.slice(0,10) == yesterday) {  // if report was from yesterday, remove it
          delete visitedReports[i];
        }
      }
    }

    // Determine if report date is equal to today's date and not visited
    // If not visited, add to visited and infoStore
    // If visited, do not add to infoStore or visited and go to next iteration
    for (var i = 0; i < (beforeStore.length - 10); i++) {
      var report_date = beforeStore[17][i].created_date.slice(0,10);  // date formatting, 0's added for single digits already
      if (report_date == today_date && !visitedReports.includes(beforeStore[17][i].created_date.slice(11,23))) {  // if report is today's date, and not posted already
        infoStore.push(beforeStore[17][i]);  // push reports to info store
        visitedReports.push(beforeStore[17][i].created_date.slice(11,23)); // push to visited because it was included in info store
        // no two reports can have the same report time down to the millesecond
      }
    }

    if (infoStore === undefined || infoStore.length == 0) {  // if no reports, exit. 30 second refresh time in home page
      console.log(trackNumber + " - " + "Nothing in infoStore, next iteration!");  // server logging purposes
      trackNumber++;
      sleep.sleep(10); // wait for new loop
      continue;  // start next loop
    }

    // get JSON info on all reports and split up sections for status
    for (let i = 0; i < infoStore.length; i++) {
       var final_status = "";  // init our status

       // add important data to our status with string concatenation
       final_status = final_status.concat('On ', today_date, ' at ', (timeConverter(infoStore[i].created_date)).toString(), ' - ');
       final_status = final_status.concat(today_date.replace(/-/g, '/'), ', an incident was reported by the NYPD as, ');
       final_status = final_status.concat((infoStore[i].descriptor).toString(), '. Location: ', (infoStore[i].incident_address).toString(), '. ');
       final_status = final_status.concat('The status of the incident is considered ', (infoStore[i].status).toString(), '.');

       final_status = final_status.toString();

       var final_tweet = { status: final_status }  // final_tweet struct

       await sendTweets(final_tweet);  // await linked to the await given at the top of while loop
       await sleep.sleep(4);
    }

    console.log(trackNumber+ " - " + "Finished tweet(s), next iteration!");  // server logging purposes
    trackNumber++;
    sleep.sleep(10); // sleep for 5 seconds

  }  // End while loop      // Catch below needed for the async wrapper that wraps around the while(1) loop
})().catch(e => { console.error(e) }) // Catch needed to prevent "Unhandled Promise Rejection" error
