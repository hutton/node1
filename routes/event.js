
require("../models/attendee");
var Calendar = require("../models/calendar").Calendar;

var moment = require("moment");
var mongoose = require("mongoose");
var _ = require("underscore");
var logger = require("../tools/logger");
var Mail = require("../tools/mail");

function createEvent(req, res){
	logger.info("Create event");

	var creatorEmail = req.body.email;
	var eventName = req.body.event;
	var attendeesText = req.body.attendees || "";

	logger.info("Creator: " + creatorEmail + " Event Name: " + eventName + " Attendees Text: " + attendeesText);

	Calendar.newCalendar(creatorEmail, "", eventName, attendeesText, function(newCalendar){
		var attendee = newCalendar.getAttendeeFromAddress(creatorEmail);

		global.app.render('mail/created-from-homepage.txt', {
			calendar: newCalendar
		}, function(err, message){
			logger.info("New calendar " + newCalendar.calendarId + " created.");

			Mail.sendMailToAttendee(newCalendar, attendee, newCalendar.name, message, "");

			res.redirect('/event/' + attendee.attendeeId);
		});
	});
}

function showEvent(res, calendar, attendeeId){
	_.each(calendar.choices, function(choice){
		choice.busyIds = _.map(choice.busy, function(busy){ return String(busy); });
		choice.freeIds = _.map(choice.free, function(free){ return String(free); });

		choice.columnDate = moment(choice.date).format("dddd Do MMM");
	});

	var cleanedAttendees = [];

	_.each(calendar.attendees, function(att){
		cleanedAttendees.push({
			_id: att._id,
			prettyName: att.name || att.email,
			me: att._id == attendeeId
		});
	});

	var cleanedCalendar = {
		name: calendar.name,
		id: calendar.id
	};

	logger.info("Showing: " + calendar.name);

	var sortedChoices = _.sortBy(calendar.choices, function(choice){
		return choice.date;
	});
	res.render('event2.html', {
		choices: JSON.stringify(sortedChoices),
		attendees: JSON.stringify(cleanedAttendees),
		calendar: JSON.stringify(cleanedCalendar),
	});
}

function renderEvent(req, res){

	if (req.route.params[0].length == 5){
		Calendar.findCalendarByAttendeeId(req.route.params[0], function(err, calendar, attendee){
			if (err){
				logger.error("Error finding calendar with attendee " + req.route.params[0]);
				logger.error("Error:" + err);

				res.send('No calendar');
			} else if (!calendar){
				logger.error("Could not find calendar with attendee " + req.route.params[0]);

				res.send('No calendar');
			} else {
				showEvent(res, calendar, attendee._id);
			}
		});
	} else if (req.route.params[0].length == 6){
		Calendar.findCalendarByCalendarId(req.route.params[0], function(err, calendar){
			if (err){
				logger.error("Error finding calendar with id " + req.route.params[0]);
				logger.error("Error:" + err);

				res.send('No calendar');
			} else if (!calendar){
				logger.error("Could not find calendar with id " + req.route.params[0]);

				res.send('No calendar');
			} else {
				showEvent(res, calendar, -1);
			}
		});
	}
}

function updateChoice(req, res){
	Calendar.findCalendarByAttendeeId(req.route.params[0], function(err, calendar, attendee){
		if (err){
			logger.error("Error finding calendar " + req.route.params[0]);
			logger.error("Error:" + err);

			res.status(404);
		} else if (!calendar){
			logger.error("Could not find calendar " + req.route.params[0]);

			res.status(404);
		} else {
			logger.info("Updating: " + calendar.name);

			var postedChoice = req.body;

			calendar.updateChoice(attendee, postedChoice.date, postedChoice.free);

			res.send(200);
		}
	});
}


function addAttendee(req, res){
	if (req.route.params[0].length == 5){
		Calendar.findCalendarByAttendeeId(req.route.params[0], function(err, calendar, attendee){
			if (err){
				logger.error("Error finding calendar " + req.route.params[0]);
				logger.error("Error:" + err);

				res.status(404);
			} else if (!calendar){
				logger.error("Could not find calendar " + req.route.params[0]);

				res.status(404);
			} else {
				var newAttendeeEmail = req.body.email;

				logger.info("Adding '" + newAttendeeEmail + "'' to: " + calendar.name);

				var newAttendee = calendar.addAttendee(newAttendeeEmail, attendee.prettyName);

				global.app.render('mail/someone-added-you-to-event.txt', {
					calendar: calendar,
					fromAttendee: attendee
				}, function(err, message){
					Mail.sendMailToAttendee(calendar, newAttendee, calendar.name, message, "");
				});

				res.send(200, 
					{
						_id: newAttendee._id,
						prettyName: newAttendee.name || newAttendee.email,
						me: false
					});
			}
		});
	} else if (req.route.params[0].length == 6){
		Calendar.findCalendarByCalendarId(req.route.params[0], function(err, calendar){
			if (err){
				logger.error("Error finding calendar " + req.route.params[0]);
				logger.error("Error:" + err);

				res.status(404);
			} else if (!calendar){
				logger.error("Could not find calendar " + req.route.params[0]);

				res.status(404);
			} else {
				var newAttendeeEmail = req.body.email;

				logger.info("Registering '" + newAttendeeEmail + "'' to: " + calendar.name);

				var newAttendee = calendar.addAttendee(newAttendeeEmail, "");

				global.app.render('mail/adding-yourself-to-event.txt', {
					calendar: calendar
				}, function(err, message){
					Mail.sendMailToAttendee(calendar, newAttendee, calendar.name, message, "");
				});

				calendar.updateCalendar(newAttendee, req.route.params[1], req.body.isFree);

				res.send(200, 
					{
						_id: newAttendee._id,
						prettyName: newAttendee.name || newAttendee.email,
						me: false,
						hash: newAttendee.attendeeId
					});
			}
		});
	}
}

exports.view = function(req, res){
	renderEvent(req, res);
};

exports.updateChoice = function(req, res){
	updateChoice(req, res);
};

exports.addAttendee = function(req, res){
	addAttendee(req, res);
};

exports.create = function(req, res){
	createEvent(req, res);
};


