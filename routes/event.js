require("../models/attendee");
var Calendar = require("../models/calendar").Calendar;

var moment = require("moment");
var mongoose = require("mongoose");
var _ = require("underscore");
var logger = require("../tools/logger");
var Mail = require("../tools/mail");
var Example = require("../tools/example");

function createEvent(req, res){
	logger.info("Create event");

	var creatorEmail = req.body.email;
	var eventName = req.body.event;
	var attendeesText = req.body.attendees || "";

	logger.info("Creator: " + creatorEmail + " Event Name: " + eventName + " Attendees Text: " + attendeesText);

	Calendar.newCalendar(creatorEmail, "", eventName, attendeesText, function(newCalendar){
		var creatorAttendee = newCalendar.getAttendeeFromAddress(creatorEmail);

		global.app.render('mail/created-from-homepage.txt', {
			calendar: newCalendar
		}, function(err, message){
			logger.info("New calendar " + newCalendar.calendarId + " created.");

			Mail.sendMailToAttendee(newCalendar, creatorAttendee, newCalendar.name, message, "");

			res.redirect('/event/' + creatorAttendee.attendeeId);
		});

		var inviter = creatorAttendee.email;

		if (creatorAttendee.name !== null && creatorAttendee.name !== ""){
			inviter = creatorAttendee.name + " (" + creatorAttendee.email + ")";
		}

		_.each(newCalendar.attendees, function(attendee){
			if (attendee != creatorAttendee){
				global.app.render('mail/someone-added-you-to-event.txt', {
					calendar: newCalendar,
					inviter: inviter
				}, function(err, message){
					Mail.sendMailToAttendee(newCalendar, attendee, newCalendar.name, message, "");
				});
			}
		});
	});
}

function example(req, res){
	var calendar = Example.getExample();

	showEvent(req, res, calendar, "A01");
}

function showEvent(req, res, calendar, attendeeId){
	var choices = [];

	_.each(calendar.choices, function(choice){
		if (choice.date !== null){
			choice.busyIds = _.map(choice.busy, function(busy){ return String(busy); });
			choice.freeIds = _.map(choice.free, function(free){ return String(free); });

			choice.columnDate = moment(choice.date).format("dddd Do MMM");

			choice.date.setHours(0,0,0,0);

			choices.push(choice);
		}
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

	var sortedChoices = _.sortBy(choices, function(choice){
		return choice.date;
	});

	var showWelcome = false;

	if (_.isUndefined(req.cookies[calendar.calendarId]) && calendar.calendarId !== 'example'){
		res.setHeader("Set-Cookie", calendar.calendarId + "=yes; Path=" + req.url + "; Expires=Fri, 31-Dec-2020 23:59:59 GMT");

		showWelcome = true;
	}

	global.app.render('mail/invite-attendee-link.txt', {
		calendar: calendar
	}, function(err, body){
		var inviteEmailLink = "mailto:?subject=" + calendar.name + "&body=" + encodeURIComponent(body);

		res.render('event2.html', {
			webAppDebug: global.app.webAppDebug,
			choices: JSON.stringify(sortedChoices),
			attendees: JSON.stringify(cleanedAttendees),
			calendar: JSON.stringify(cleanedCalendar),
			name: calendar.name,
			showWelcome: showWelcome,
			inviteEmailLink: inviteEmailLink
		});
	});
}

function renderEvent(req, res){
	if (req.route.params[0].length == 9 || req.route.params[0].length == 5){
		Calendar.findCalendarByAttendeeId(req.route.params[0], function(err, calendar, attendee){
			if (err){
				logger.error("Error finding calendar with attendee " + req.route.params[0]);
				logger.error("Error:" + err);

				res.status(404);
				res.send('No calendar');
			} else if (!calendar){
				logger.error("Could not find calendar with attendee " + req.route.params[0]);

				res.status(404);
				res.send('No calendar');
			} else {
				showEvent(req, res, calendar, attendee._id);
			}
		});
	} else if (req.route.params[0].length == 6){
		Calendar.findCalendarByCalendarId(req.route.params[0], function(err, calendar){
			if (err){
				logger.error("Error finding calendar with id " + req.route.params[0]);
				logger.error("Error:" + err);

				res.status(404);
				res.send('No calendar');
			} else if (!calendar){
				logger.error("Could not find calendar with id " + req.route.params[0]);

				res.status(404);
				res.send('No calendar');
			} else {
				showEvent(req, res, calendar, -1);
			}
		});
	} else {
		res.status(404);
		res.send("We can't find the event you're looking for.")
	}
}

function updateChoice(req, res){
	if (req.route.params[0] == "example"){
		res.send(200);		
	} else {
		Calendar.findCalendarByAttendeeId(req.route.params[0], function(err, calendar, attendee){
			if (err){
				logger.error("Error finding calendar " + req.route.params[0]);
				logger.error("Error:" + err);

				res.send(404);
			} else if (!calendar){
				logger.error("Could not find calendar " + req.route.params[0]);

				res.send(404);
			} else {
				logger.info("Updating: " + calendar.name);

				var postedChoice = req.body;

				calendar.updateChoice(attendee, postedChoice.date, postedChoice.free);

				res.send(200);
			}
		});
	}
}

function addAttendee(req, res){
	if (req.route.params[0].length == 5 || req.route.params[0].length == 9){
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

				var inviter = attendee.email;

				if (attendee.name !== null && attendee.name !== ""){
					inviter = attendee.name + " (" + attendee.email + ")";
				}

				global.app.render('mail/someone-added-you-to-event.txt', {
					calendar: calendar,
					inviter: inviter
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

				calendar.updateCalendar(newAttendee, [], req.body.isFree.split(','));

				res.redirect('/event/' + newAttendee.attendeeId);
			}
		});
	}
}

exports.example = function(req, res){
	example(req, res);
};

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


