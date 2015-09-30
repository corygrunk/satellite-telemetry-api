// TO DOs
// Need to grab the time stamp from Celestrak instead of generating a new one.
// Need to poll Celestrak less often and cache the data, as it only updates daily.
// Need a better way to terminate the last line. Should check if it's empty first"
// Add tests

var express = require('express');
var request = require('request');

var app = express();
var port = process.env.PORT || 5000;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

var router = express.Router();

var url = 'http://www.celestrak.com/NORAD/elements/stations.txt';
var json;


// MIDDLEWARE
// ==============================================

// Route middleware that will happen on every request
router.use(function(req, res, next) {
	// Log each request to the console
	console.log(req.method, req.url);

	next();	
});


// ROUTES
// ==============================================

router.get('/', function(req, res) {
  res.render('index', {title : 'Satellite Telemetry JSON API'});
});


router.get('/api', function(req, res) {

	request(url, function(error, response, data) {
		if(!error){	
			var raw = data;
			raw = data.replace(/  +/g, ' '); // REMOVE EXTRA SPACES
			raw = raw.replace(/ \r/g, '');  // NORMALIZE RETURNS
			raw = raw.split('\n');
			var jsonBegin = '{\n\t"message": "success",\n\t"timestamp": ' + new Date().getTime() + ',\n\t"satellite": {';
			var jsonEnd = '\n\t}\n}';

			for (var i=0; i < raw.length - 1; i+=3) { // SATELLITE NAME
				raw[i] = '\t\n\t\t"' + raw[i] + '": {\n'; 
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
			console.log(json);

		} else if (error) {
			console.log(error);
			console.log(response);
		}
	})

	res.json('api', json);

});

app.use('/', router);


// START THE SERVER
// ==============================================

app.listen(port, function() {
  console.log("Listening on " + port);
});