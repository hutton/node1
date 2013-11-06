var SendGrid = require('sendgrid');
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

function extractMessageFromRequest(requestBody){
	var message = "";

	if (_.has(requestBody,"body-plain") && requestBody['body-plain'] != null){
		logger.info("Using body-plain");

		message = requestBody['body-plain'];

		message = Mail.firstResponse(message);
	}
	else if (_.has(requestBody,"body-html") && requestBody['body-html'] != null){
		logger.info("Using body-html");

		message = Mail.htmlMailToText(requestBody['body-html']);

		message = Mail.firstResponse(message);
	} else if (_.has(requestBody,"html") && requestBody.html != null){
		logger.info("Using html");

		message = Mail.htmlMailToText(requestBody.html);

		message = Mail.firstResponse(message);
	} else {
		logger.info("Using requestBody.text");

		message = requestBody.text;

		message = Mail.firstResponse(message);
	}

	return message;
}

function processEmailRequest(req, res, createCalendarCallback, updateCalendarCallback, error){
	var to = "";

	if (_.has(req.body,"recipient")){
		to = Mail.getEmailAddresses(req.body.recipient)[0];
	} else {
		to = Mail.getEmailAddresses(req.body.to)[0];
	}

	var fromName = Mail.getEmailName(req.body.from);
	var from = Mail.getEmailAddresses(req.body.from)[0];
	var message = extractMessageFromRequest(req.body);
	var subject = req.body.subject;

	logger.info("Mail from: " + from + " (" + fromName + ")");
	logger.info("Mail to: " + to);
	logger.info("Mail subject: " + subject);
	logger.info("Mail message: " + message);

	if (startsWith(to, "start-betalist@")){
		var newCalendar = Calendar.newCalendar(to, from, fromName, subject, message, function(newCalendar){
			createCalendarCallback(newCalendar);
		});
	} else if (startsWith(to, "start@")){
		Mail.sendWereInBetaEmail(from);

		error( 'Trying to start event with ' + to);
	} else {
		var localEmail = getLocalPartOfEmail(to);

		var calendar = Calendar.findCalendar(localEmail, function(err, calendar){
			if (err){
				logger.error("Error finding event: " + localEmail);
				logger.error("Error: " + err);
				error('Error finding calendar');
			} else if (!calendar){
				Mail.sendCouldntFindCalendarEmail(from, to);

				logger.error("Could not find calendar " + localEmail);

				res.send('No calendar');
				error('No calendar');
			} else {
				var fromAttendee = calendar.getAttendeeFromAddress(from);

				if (fromAttendee != null){
					if (subject.toLowerCase() == "add"){
						logger.info("Adding attendee to event");

						calendar.addAttendee(message, fromName);

						updateCalendarCallback(calendar);
					} else if (subject.toLowerCase() == "remove"){
						logger.info("Removing attendee from event");

						calendar.removeAttendee(message);

						updateCalendarCallback(calendar);
					} else {
						if (fromAttendee.name === ""){
							fromAttendee.name = fromName;
						}

						var dates = Nlp.processBody(message);

						calendar.updateCalendar(fromAttendee,
							dates[0],
							dates[1]);

						Mail.sendMail(calendar, subject, message, fromName);

						updateCalendarCallback(calendar);
					}
				} else {
					Mail.sendCouldntFindYouInCalendarEmail(from, to);

					logger.error("Couldn't find " + from + " in calendar " + calendar.id);

					error( from + ' is not in calendar ' + calendar.id);
				}
			}
		});
	}
}

exports.newMail = function(req, res){
	logger.info("New mail from web");

	var to = req.body.to;
	var from = req.body.from;
	var subject = req.body.subject;
	var message = req.body.message;

	logger.info("Mail from: " + from);
	logger.info("Mail to: " + to);
	logger.info("Mail subject: " + subject);
	logger.info("Mail message: " + message);

	var newCalendar = Calendar.newCalendar(to, from, "", subject, message, function(newCalendar){
		res.send(200, { redirect: '/event/' + newCalendar.attendees[0].attendeeId });
	});
};

exports.sendGridReceive = function(req, res){
	logger.info("Mail received from HTTP POST");
	
	processEmailRequest(req, res, function(newCalendar){
		res.send( 200 );
	},
	function(calendar){
		res.send( 200 );
	},
	function(error){
		logger.info(error);

		res.send( 200 );
	});
};

exports.receive = function(req, res){
	logger.info("Mail received from browser");
	
	logger.info(req.body);
	
	logger.info("mandrill_events: " + req.body.mandrill_events);
	
	logger.info("mandrill_events.event: " + req.body.mandrill_events.event);

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
