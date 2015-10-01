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
	scraper.satellites(function (error, data) {
		res.status(200).json(data); 
	});
});

app.use('/', router);


// START THE SERVER
// ==============================================

app.listen(port, function() {
  console.log("Listening on " + port);
});