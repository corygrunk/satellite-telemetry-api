var express = require('express');
var fs = require('fs');
var request = require('request');

var app = express();
var url = 'http://www.celestrak.com/NORAD/elements/stations.txt';
var json;

/* TO DOs */
/* Need to grab the time stamp from Celestrak instead of generating a new one. */

app.get('/', function(req, res){

	request(url, function(error, response, data) {
		if(!error){	
			var raw = data;
			raw = data.replace(/  +/g, ' '); // REMOVE EXTRA SPACES
			raw = raw.replace(/ \r/g, '');  // NORMALIZE RETURNS
			raw = raw.split('\n');

			var jsonBegin = '{\n\t"message": "success",\n\t"timestamp": ' + new Date().getTime() + ',\n\t"satellite": [\n';
			var jsonEnd = '\n\t]\n}';

			for (var i=0; i < raw.length - 1; i+=3) { // SATELLITE NAME
				//console.log(raw[i]);
				raw[i] = '\t{\n\t\t"' + raw[i] + '": {\n'; 
			};
			for (var i=1; i < raw.length; i+=3) { // LINE 1
				//console.log(raw[i]);
				raw[i] = '\t\t\t"line1": "' + raw[i].slice(0, - 1) + '",\n';
			};
			for (var i=2; i < raw.length; i+=3) { // LINE 2
				//console.log(raw[i]);
				if (raw.length == i + 2) {
					raw[i] = '\t\t\t"line2": "' + raw[i].slice(0, - 1) + '"\n\t\t}\n\t}';
				} else {
					raw[i] = '\t\t\t"line2": "' + raw[i].slice(0, - 1) + '"\n\t\t}\n\t},\n';
				}
			};

			raw.unshift(jsonBegin);
			raw.push(jsonEnd);
			raw = raw.join('');
			json = JSON.parse(raw);
			console.log(json.satellite[0]);

			// fs.writeFile('output.json', raw, function(err){
			// 	console.log('File successfully written: output.json.');
			// });

		} else if (error) {
			console.log(error);
			console.log(response);
		}
	})

})

app.listen('8081')

console.log('Listening on port: 8081');

exports = module.exports = app;