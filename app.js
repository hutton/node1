
/**
 * Module dependencies.
 */

 var dbPath      = 'mongodb://localhost:27017/test';

 var express = require('express')
 , routes = require('./routes')
 , user = require('./routes/user')
 , calendar = require('./routes/calendar')
 , mail = require('./routes/mail')
 , http = require('http')
 , path = require('path')
 , mongoose = require('mongoose');

 var app = express();

 app.configure(function(){
 	app.set('port', process.env.PORT || 3000);
 	app.set('views', __dirname + '/views');
 	app.set('view engine', 'ejs');
 	app.set('view cache', false);
 	app.use(express.favicon());
 	app.use(express.logger('dev'));
 	app.use(express.bodyParser());
 	app.use(express.methodOverride());
 	app.use(express.cookieParser('your secret here'));
 	app.use(express.session());
 	app.use(app.router);
 	app.use(require('less-middleware')({ src: __dirname + '/public' }));
 	app.use(express.static(path.join(__dirname, 'public')));
 	mongoose.connect(dbPath, function onMongooseError(err) {
 		if (err) throw err;
 	});

 });

 app.configure('development', function(){
 	app.use(express.errorHandler());
 });

 app.get('/', routes.index);
 app.get('/users', user.list);
 app.get('/new', calendar.new);
 app.get('/mail', mail.show);
 app.post('/mail', mail.receive);

 app.get(/^\/[a-zA-Z0-9]{10}$/, calendar.view);

 global.app = app;
 
 http.createServer(app).listen(app.get('port'), function(){
 	console.log("Express server listening on port " + app.get('port'));
 });
