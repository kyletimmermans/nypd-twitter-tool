// NodeJS
// npm install jsdom, jquery, twitter
// script runs every 10 seconds

const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );

// load from env file
var Twitter = require('twitter'); // import Twitter npm module

var client = new Twitter({
  consumer_key: 'fGt1EMRx3fPaL04Ihy99yv9Ht',
  consumer_secret: 'wHArp5CgS85UB3McAy8lnoHTZFqyEvkqr1bPphcuHC5jIbzqTY',
  access_token_key: '1309210840298643461-IiN7UGFlsazpvpt8ZjoeXQnWofP2kA',
  access_token_secret: 'VQCCFzc8r3wCxRcev66Gs8bKHh8gEd8WxLQepeYoomffk'
});

var visitedReports = []; // store already posted reports, do this to prevent dups on twitter

// keep running indefinitely
while (1) {
  // pull NYPD API info w/ jQuery
  $.ajax({
      url: "https://data.cityofnewyork.us/resource/fjn5-bxwg.json?incident_zip=10458",  // zip query specified in url
      type: "GET",
      data: {
        "$limit" : 10,  // Pull number of entries
        "$$app_token" : ""  // Leave empty, we can still get public data w/o token
      }
  }).done(function(data) {

    // Create today's date
    var today = new Date();  // create date object instance
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');  // January is 0
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;  // match formatting of API dates

    // following code block used to prevent dupes in using a visited queue
    // once 12:00AM comes around, queue removes data points from the day before and starts fresh
    var infoStore = []; // store current reports

    var currentTime = '';  // init current time
    currentTime = currentTime.concat(String(today.getHours()), String(today.getMinutes()), String(today.getSeconds())); // hours minutes to string

    // get yesterday's date to clear out yesterday's data for next day's queue
    if (currentTime.slice(0,2) == "23" && currentTime.slice(2,4) == "59" && "00" <= currentTime.slice(4,6) >= "30") {
      var yesterday = today; // get date just before next day
    }

    // At 12:00AM of next day, remove visited reports from yesterday
    if (currentTime.slice(0,2) == "00" && currentTime.slice(2,4) == "00" && "00" <= currentTime.slice(4,6) >= "30") { // 15 second grace period
      // empty visited queue of visited reports
      for (var i = 0; i < visitedReports.length; i++) {
        if (visitedReports[i].created_date.slice(0,10) == yesterday) {  // if report was from yesterday, remove it
          delete visitedReports[i]
        }
      }
    }

    // Determine if report date is equal to today's date and not visited
    // If not visited, add to visited and infoStore
    // If visited, do not add to infoStore or visited and go to next iteration
    for (var key of Object.keys(data)) {
      var report_date = data[key].created_date.slice(0,10);  // date formatting, 0's added for single digits already
      if (report_date == today && !visitedReports.include(data[key])) {  // if report is today's date, and not posted already
        infoStore.push(data[key]);  // push reports to info store
        visitedRepors.push(data[key]); // push to visited because it was included in info store
      }
    }

    if (infoStore === undefined || infoStore.length == 0) {  // if no reports, exit. 30 second refresh time in home page
        console.log("No reports found!")
        setTimeout(function(){console.log("New Loop Initiated")}, 10000); // wait for new loop
        continue;  // go to next loop
    }

    // create AM/PM time return function
    function timeConverter(time) {
      var newTime = time.slice(11,16);
      if (parseInt(newTime.slice(0,2)) < 12) {
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

    // get JSON info on all reports and split up sections for status
    for (var i = 0; i < infoStore.length; i++) {
       var final_status = "";  // init our status

       // add important data to our status with string concatenation
       final_status = final_status.concat('At ', (timeConverter(infoStore[i].created_date)).toString(), ', an incident was reported by the NYPD as, ');
       final_status = final_status.concat((infoStore[i].descriptor).toString(), '. Location: ', (infoStore[i].incident_address).toString(), '. ');
       final_status = final_status.concat('The status of the incident is considered ', (infoStore[i].status).toString(), '.');

       var final_tweet = {  // create tweet struct
         status: final_status
       }

       // Twitter npm module tweet function
       client.post('statuses/update', final_tweet, function(error, tweet, response) {
         if(error) {
           console.log(error);
         }
         console.log(tweet);  // Tweet body.
         console.log(response);  // Raw response object.
       });
    }
}); // end ajax function

// sleep for 10 seconds until next loop
setTimeout(function(){console.log("New Loop Initiated")}, 10000);

} // end while loop
