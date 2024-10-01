![Version 2.0](https://img.shields.io/badge/Version-2.0-orange.svg)
![Node.js 12.18.4](https://img.shields.io/badge/Node.js-12.18.4-green.svg)
![Latest Commit](https://img.shields.io/github/last-commit/kyletimmermans/nypd-twitter-tool?color=red&label=Latest%20Commit)
[![kyletimmermans Twitter](http://img.shields.io/twitter/url/http/shields.io.svg?style=social&label=Follow)](https://twitter.com/kyletimmermans)

# <div align="center">NYPD Twitter Tool</div>

This tool collects reported incidents from the [NYPD API](https://data.cityofnewyork.us/resource/fjn5-bxwg.json) which is an API that returns NYPD reported incidents into a json format.
The tool then connects to a developer twitter account and tweets the incidents that were reported that day into a small and readable report format. See [@fordhamcyberpa1](https://twitter.com/fordhamcyberpa1)
on Twitter for the final product!

</br>

|NodeJS Requirements|
|-------------------|
|jsdom|
|jquery|
|twitter|
|sleep|

</br>

## Screenshots 

### Result
<p align="center">
  <img src="https://github.com/kyletimmermans/nypd-twitter-tool/blob/master/source/twitter.png?raw=true" alt="Result"/>
</p>

### Backend
<p align="center">
  <img src="https://github.com/kyletimmermans/nypd-twitter-tool/blob/master/source/terminal1.png?raw=true" alt="Backend"/>
</p>


</br>

#### Clear Duplicate Algorithm
<div>1) Initialize yesterday var at 11:59 PM (Next day this date will actually be yesterday)</div>
<div>2) Next day at 12:00 AM, clear anything out of duplicate array that has the attribute: date = yesterday (So we don't clear any data from today by accident)</div>
<div>3) Only get items that have: date = today  (To prevent getting any of yesterday's data)</div>
<div>4) Go back to step 1</div>

</br>

*Note: Originally built with the idea that the NYPD API was a live update, turns out that it's delayed by two days. The dates for data can be delayed as long as a year.*
