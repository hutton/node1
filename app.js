/**
 * Module dependencies.
 */

 
 var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI;
 var webAppDebug = process.env.WEBAPP_DEBUG;

 var express = require('express')
 , routes = require('./routes')
 , events = require('./routes/event')
 , user = require('./routes/user')
 , calendar = require('./routes/calendar')
 , mail = require('./routes/mail')
 , http = require('http')
 , path = require('path')
 , mongoose = require('mongoose')
 , cons = require('consolidate')
 , logger = require('./tools/logger')
 , _ = require('underscore');

 if (_.isUndefined(connectionString)){
	connectionString = 'mongodb://localhost:27017/test';
 }

if (_.isUndefined(webAppDebug) || webAppDebug === null || webAppDebug === 'On'){
	enableWebAppDebug = true;
 } else {
	enableWebAppDebug = false;
 }

 var app = express();

var winstonStream = {
	write: function(message, encoding){
		logger.info(message);
	}
};
 

Array.prototype.removeElement = function(element) {
	var index = this.indexOf(element);
 
	while (index !== -1){
		this.splice(index, 1);
		index = this.indexOf(element);
	}
};

 
 app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'html');
	app.set('view cache', false);
	app.use(express.favicon());
	app.use(express.logger({stream:winstonStream}));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(app.router);
	//app.use(require('less-middleware')({ src: __dirname + '/public' }));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use('/logs', express.static(path.join(__dirname, 'iisnode')));

	app.use(function(req, res, next){
		res.status(404);

		// respond with html page
		if (req.accepts('html')) {
			res.render('404.html', { url: req.url });
			return;
		}

		// respond with json
		if (req.accepts('json')) {
			res.send({ error: 'Not found' });
			return;
		}

		// default to plain-text. send()
		res.type('txt').send('Not found');
	});

	connectionString = connectionString + "?maxIdleTimeMS=60000";

	logger.info("Connecting to: " + connectionString);
	logger.info("WebDebug: " + enableWebAppDebug);

	var options = {
		server: {
			socketOptions: {
				keepAlive: 1
			}
		},
		replset: {
			socketOptions: {
				keepAlive: 1
			}
		}
	};

	mongoose.connect(connectionString, options);
 });

 app.engine('html', cons.underscore);
 app.engine('txt', cons.underscore);

 app.configure('development', function(){
	app.use(express.errorHandler());
 });

 app.get('/', routes.index);
 app.get('/home2', routes.index2);
 app.post('/create', events.create);
 app.get('/about', routes.about);

 app.get('/help', routes.help);
 app.get('/users', user.list);
 app.get('/new', calendar.new);
 app.get('/mail', mail.show);

 app.get('/event2', routes.event2);
 app.get('/email', routes.email);
 app.get('/mandrillReceive', mail.mandrillShow);
 app.get('/calendar/*', calendar.view);
 app.get('/calendar-text/*', calendar.viewText);
 
 app.get('/event/example', events.example);
 app.get('/event/example/*', events.example);
 app.get('/event/*', events.view);
 

 app.post('/event/*/choice', events.updateChoice);
 app.post('/event/*/add', events.addAttendee);
 app.post('/event/*/update-name', events.updateAttendeeName);
 app.post('/event/*/selectableDates', events.updateSelectableDates);
 app.delete('/event/*/attendee/*', events.removeAttendee);
 app.put('/event/*/details', events.updateDetails);
 app.post('/mail', mail.receive);

 app.post('/mandrillReceive', mail.mandrillReceive);

 //app.get(/^\/[a-zA-Z0-9]{10}$/, calendar.view);


// app.get('/*', routes.notFound);

 app.ourEmail = "convenely@gmail.com";
 app.enableWebAppDebug = enableWebAppDebug;

 global.app = app;
 
 http.createServer(app).listen(app.get('port'), function(){
	logger.info("Express server listening on port " + app.get('port'));
 });

