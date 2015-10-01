var cheerio = require('cheerio');
var request = require('request');

var url = 'http://www.celestrak.com/NORAD/elements/stations.txt';
var dateUrl = 'http://www.celestrak.com/NORAD/elements/';
var json;
var updatedDate;
var reRemoveDay = /(\([^\)]+\))/;
var regYear = /[\s](\d\d\d\d)/;
var regMonth = /([^\d\s]+)/;
var regDay = /[^\d\s]+\s(\d+)/;

function scraper(config) {
	config = config || {};

	var monthToDigit = function (month) {
		if (month === 'January') {
			return 1;
		} else if (month === 'February') {
			return 2;
		} else if (month === 'March') {
			return 3;
		} else if (month === 'April') {
			return 4;
		} else if (month === 'May') {
			return 5;
		} else if (month === 'June') {
			return 6;
		} else if (month === 'July') {
			return 7;
		} else if (month === 'August') {
			return 8;
		} else if (month === 'September') {
			return 9;
		} else if (month === 'October') {
			return 10;
		} else if (month === 'November') {
			return 11;
		} else if (month === 'December') {
			return 12;
		}
	}

	var dateScrape = function (callback) {
		request(dateUrl, function(err, response, data) {
			if(!err) {
				$ = cheerio.load(data);
				var date = $('h2').text();
				date = date.replace('Data Updated:','');
				date = date.replace(reRemoveDay,'');
				var year = regYear.exec(date)[1];
				var month = monthToDigit(regMonth.exec(date)[1]);
				var day = regDay.exec(date)[1];
				var unixtime = new Date(year, month, day).getTime();
				callback(err, unixtime);
			}
		});
	}

	this.satellites = function (callback) {
		dateScrape(function (err, dateScraped) {
			if (dateScraped !== updatedDate) {
				updatedDate = dateScraped;
				request(url, function(err, response, data) {
					if(!err) {	
						var raw = data;
						raw = data.replace(/  +/g, ' '); // REMOVE EXTRA SPACES
						raw = raw.replace(/ \r/g, '');  // NORMALIZE RETURNS
						raw = raw.split('\n');
						var jsonBegin = '{\n\t"message": "success",\n\t"timestamp": ' + dateScraped + ',\n\t"satellite": {';
						var jsonEnd = '\n\t}\n}';

						for (var i=0; i < raw.length; i+=3) { // SATELLITE NAME
							if (raw[i] != '') {
								raw[i] = '\t\n\t\t"' + raw[i] + '": {\n'; 
							}
						};
						for (var i=1; i < raw.length; i+=3) { // LINE 1
							raw[i] = '\t\t\t"line1": "' + raw[i].slice(0, - 1) + '",\n';
						};
						for (var i=2; i < raw.length; i+=3) { // LINE 2
							if (raw.length == i + 2) {
								raw[i] = '\t\t\t"line2": "' + raw[i].slice(0, - 1) + '"\n\t\t}';
							} else {
								raw[i] = '\t\t\t"line2": "' + raw[i].slice(0, - 1) + '"\n\t\t},';
							}
						};
						raw.unshift(jsonBegin);
						raw.push(jsonEnd);
						raw = raw.join('');
						json = JSON.parse(raw);
						callback(err, json);
					}
				});
			} else {
				callback(err, json);
			} 
		});
	}
}

module.exports = scraper;