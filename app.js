// TO DOs
// Need to poll Celestrak less often and cache the data, as it only updates daily.
// Add tests

var express = require('express');
var Scraper = require('./lib/scraper.js');
var scraper = new Scraper();
var app = express();
var port = process.env.PORT || 5000;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

var router = express.Router();
var satelliteJson = {};
var pollingInterval = 60; // minutes
var pollCounter = 0;

// POLL CELESTRAK
scraper.satellites(function (error, data) {
	satelliteJson = data;
	pollCounter = pollCounter + 1;
	console.log(pollCounter);
});
setInterval(function() {
	scraper.satellites(function (error, data) {
		satelliteJson = data;
		pollCounter = pollCounter + 1;
	});
}, pollingInterval * 60000); // Poll Celestrak every x minutes


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
  res.render('index', {title : 'Satellite Telemetry JSON API', pageData : pollCounter});
});


router.get('/api', function(req, res) {
	res.status(200).json(satelliteJson); 
});

app.use('/', router);


// START THE SERVER
// ==============================================

app.listen(port, function() {
  console.log("Listening on " + port);
});