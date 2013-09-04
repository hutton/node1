/**
 * Module dependencies.
 */


var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI;

var express = require('express')
	, routes = require('./routes')
	, user = require('./routes/user')
	, calendar = require('./routes/calendar')
	, event = require('./routes/event')
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

var app = express();

var winstonStream = {
write: function(message, encoding){
	logger.info(message);
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
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/logs', express.static(path.join(__dirname, 'iisnode')));

connectionString = connectionString + "?maxIdleTimeMS=60000";

logger.info("Connecting to: " + connectionString);

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
app.get('/help', routes.help);
app.get('/users', user.list);
app.get('/new', calendar.new);
app.get('/mail', mail.show);
app.get('/event', routes.event);
app.get('/event2', routes.event2);
app.get('/highlight-demo', routes.highlight);
app.post('/mail', mail.receive);
app.post('/sendgrid', mail.sendGridReceive);
app.post('/new-mail', mail.newMail);

//app.get(/^\/[a-zA-Z0-9]{10}$/, calendar.view);
app.get('/calendar/*', calendar.view);
app.get('/calendar-text/*', calendar.viewText);

app.get('/event/*', event.view);

global.app = app;

http.createServer(app).listen(app.get('port'), function(){
	logger.info("Express server listening on port " + app.get('port'));
});

