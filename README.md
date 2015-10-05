# satellite-telemetry-api
** An api to return the TLE (two line element) data for space stations in orbit in JSON format.**

This api scrapes the data at Celestak and returns the TLE information for a number of space stations. I initally created this api because I couldn't find TLE info in JSON, then I discovered Space-Track.org which provides a way to query TLE data. It doesn't return JSON, but the data it does return is very simple and usable. Space-Track's api is probably a better source for this, but oh well. I coded this one, so I might as well use it. Built with Node.js. :)
