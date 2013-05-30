var winston = require('winston');
var Loggly = require('winston-loggly').Loggly;
 
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {timestamp: true});
 
if (process.env.NODE_ENV == 'production') {
  winston.add(Loggly, {
		timestamp: true,
		subdomain: 'convenely',
		inputToken: '4eb05be2-c666-41d5-b6ee-061642221cbd'
	});
}
 
var logger = winston;
 
module.exports = logger;