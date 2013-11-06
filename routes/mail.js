var SendGrid = require('sendgrid');
var fs = require('fs');
var Calendar = require("../models/calendar").Calendar;
var _ = require("underscore");

var Mail = require("../tools/mail");
var Nlp = require("../tools/nlp");
var logger = require("../tools/logger");

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

function processEmailRequest(parsedReq, createCalendarCallback, updateCalendarCallback, error){
	var to = parsedReq.to;
	var from = parsedReq.from;
	var fromName = parsedReq.fromName;
	var subject = parsedReq.subject;
	var message = parsedReq.message;

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

				error('No calendar');
			} else {
				var fromAttendee = calendar.getAttendeeFromAddress(from);

				if (fromAttendee !== null){
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

function processIncomingMandrillEmail(mandrill_event){
	if (mandrill_event.event != "inbound"){
		logger.error("Mandrill event '" + mandrill_event.event + "' found, expected 'inbound'");

		return null;
	}

	var parsed = {};

	parsed.to = mandrill_event.msg.to[0][0];
	parsed.fromName = mandrill_event.msg.from_name;
	parsed.from = mandrill_event.msg.from_email;
	parsed.subject = mandrill_event.msg.subject;

	if (_.has(mandrill_event.msg, "text") && mandrill_event.msg.text !== null){
		parsed.message = Mail.firstResponse(mandrill_event.msg.text);
	} else if (_.has(mandrill_event.msg, "html") && mandrill_event.msg.html !== null){
		var message = Mail.htmlMailToText(mandrill_event.msg.html);

		parsed.message = Mail.firstResponse(message);
	}

	return parsed;
}

exports.show = function(req, res){
	res.render('mail.html');
};

exports.receive = function(req, res){
	logger.info("Mail received from browser");

	var parsed = {};

	parsed.to = Mail.getEmailAddresses(req.body.to)[0];
	parsed.fromName = Mail.getEmailName(req.body.from);
	parsed.from = Mail.getEmailAddresses(req.body.from)[0];
	parsed.message = extractMessageFromRequest(req.body);
	parsed.subject = req.body.subject;

	processEmailRequest(parsed, function(newCalendar){
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

exports.mandrillShow = function(req, res){
	res.send(200, 'Ready!');
};

exports.mandrillReceive = function(req, res){
	logger.info("Mail received from /mandrillReceive");

	var mandrill_events = JSON.parse(req.body.mandrill_events);

	logger.info("mandrill_events: " + mandrill_events);

	_.each(mandrill_events, function(mandrill_event){
		logger.info("mandrill_event: " + mandrill_event);

		var parsed = processIncomingMandrillEmail(mandrill_event);

		logger.info("parsed mandrill_event: " + parsed);

		if (parsed !== null){
			processEmailRequest(parsed,
				function(newCalendar){
					res.send( 200 );
				},
				function(calendar){
					res.send( 200 );
				},
				function(error){
					logger.info(error);

					res.send( 200 );
				});
		}
	});
};
