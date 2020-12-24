![Version 2.0](https://img.shields.io/badge/version-v2.0-orange.svg)
![NodeJS 12.18.4](https://img.shields.io/badge/nodejs-12.18.4-green.svg)
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

Note: Originally built with the idea that the NYPD API was a live update, turns out that it's delayed by two days. The dates for data can be delayed as long as a year.
