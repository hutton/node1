
var SendGrid = require('sendgrid-nodejs');
var fs = require('fs');
var Calendar = require("../models/calendar").Calendar;
var _ = require("underscore");

var Mail = require("../tools/mail");
var Nlp = require("../tools/nlp");
var logger = require("../tools/logger");

exports.show = function(req, res){
	res.render('mail.html');
};

function startsWith(input, query){
	return input.substr(0,query.length) === query;
}

function getLocalPartOfEmail(address){
	return address.split("@")[0];
}

function processEmailRequest(req, res, createCalendarCallback, updateCalendarCallback, error){
	var message = req.body.text;
	var to = Mail.getEmailAddresses(req.body.to)[0];
	var fromName = Mail.getEmailName(req.body.from);
	var from = Mail.getEmailAddresses(req.body.from)[0];

	if (req.body.html != null){
		message = Mail.htmlMailToText(req.body.html);

		message = Mail.firstResponse(message);
	}

	logger.info("Mail from: " + from + " (" + fromName + ")");
	logger.info("Mail to: " + to);
	logger.info("Mail message: " + message);

	if (startsWith(to, "start@")){
		var newCalendar = Calendar.newCalendar(to, from, fromName, req.body.subject, message, function(newCalendar){
			createCalendarCallback(newCalendar);
		});
	} else {
		var localEmail = getLocalPartOfEmail(to);

		var calendar = Calendar.findCalendar(localEmail, function(err, calendar){
			if (err){
				logger.error("Error finding event: " + localEmail);
				logger.error("Error: " + err);
				error('Error finding calendar');
			} else if (!calendar){
				logger.error("Could not find calendar " + localEmail);

				res.send('No calendar');
				error('No calendar');
			} else {
				var fromAttendee = calendar.getAttendeeFromAddress(from);

				if (fromAttendee.name == ""){
					fromAttendee.name = fromName;
				}

				var dates = Nlp.processBody(message);

				if (fromAttendee != null){
					calendar.updateCalendar(fromAttendee, 
						dates[0], 
						dates[1]);

					Mail.sendMail(calendar, req.body.subject, message);
				} else {
					logger.error("Couldn't find " + from + " in calendar " + calendar.name);
				}

				updateCalendarCallback(calendar);
			}
		});
	}
}

exports.sendGridReceive = function(req, res){
	logger.info("Mail received from SendGrid");

	processEmailRequest(req, res, function(newCalendar){
		res.send( 200 );
	},
	function(calendar){
		res.send( 200 );
	},
	function(error){
		logger.info(req.body);

		res.send( 500 );
	});

}

exports.receive = function(req, res){
	logger.info("Mail received from browser");

	processEmailRequest(req, res, function(newCalendar){
		res.redirect('/calendar/' + newCalendar.id);	
	},
	function(calendar){
		res.redirect('/calendar/' + calendar.id);	
	},
	function(message){
		logger.info(req.body);

		res.send(message);
	});
};
