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
	var name = req.body.name || "";
	var attendeesText = req.body.attendees || "";

	logger.info("Creator: " + creatorEmail + " Event Name: " + eventName + " Attendees Text: " + attendeesText);

	Calendar.newCalendar(creatorEmail, name, eventName, attendeesText, function(newCalendar){
		var creatorAttendee = newCalendar.getAttendeeFromAddress(creatorEmail);

		global.app.render('mail/created-from-homepage.txt', {
			calendar: newCalendar
		}, function(err, message){
			logger.info("New calendar " + newCalendar.calendarId + " created.");

			Mail.sendMailToAttendee(newCalendar, creatorAttendee, newCalendar.name, message, "");
			
			res.redirect('/event/' + creatorAttendee.attendeeId);
		});

		Mail.sendShareLinkToAttendee(newCalendar, creatorAttendee);

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

	showEvent(req, res, calendar, null);
}

function showEvent(req, res, calendar, attendeeId){
	var choices = [];

	logger.info("Rendering event: " + calendar.name + " (" + req.route.params[0] + ")");

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
			id: att._id,
			prettyName: att.name || att.email,
			me: att._id == attendeeId,
			email: att.email
		});
	});

	var cleanedCalendar = {
		name: calendar.name,
		id: calendar.id,
		calendarId: calendar.calendarId,
		description: calendar.description,
		venue: calendar.venue,
		datesSelected: calendar.datesSelected,
		everythingSelectable: calendar.everythingSelectable
	};

	var sortedChoices = _.sortBy(choices, function(choice){
		return choice.date;
	});

	global.app.render('mail/invite-attendee-link.txt', {
		calendar: calendar
	}, function(err, body){
		var inviteEmailLink = "mailto:?subject=" + calendar.name + "&body=" + encodeURIComponent(body);

		res.render('event2.html', {
			webAppDebug: global.app.enableWebAppDebug,
			choices: JSON.stringify(sortedChoices),
			attendees: JSON.stringify(cleanedAttendees),
			calendar: JSON.stringify(cleanedCalendar),
			calendarId: calendar.calendarId,
			id: calendar.id,
			name: calendar.name,
			inviteEmailLink: inviteEmailLink
		});

		logger.info("Rendered event: " + calendar.name + " (" + req.route.params[0] + ")");
	});
}

function renderEvent(req, res){
	var id = req.route.params[0].split("/")[0];

	if (id.length == 9 || id.length == 5){
		logger.info("Looking for event: " + id);

		Calendar.findCalendarByAttendeeId(id, function(err, calendar, attendee){
			if (err){
				logger.error("Error finding calendar with attendee " + id);
				logger.error("Error:" + err);

				res.status(404);
				res.send('No calendar');
			} else if (!calendar){
				logger.error("Could not find calendar with attendee " + id);

				res.status(404);
				res.send('No calendar');
			} else {
				showEvent(req, res, calendar, attendee._id);
			}
		});
	} else if (id.length == 6){
		logger.info("Looking for event: " + id);

		Calendar.findCalendarByCalendarId(id, function(err, calendar){
			if (err){
				logger.error("Error finding calendar with id " + id);
				logger.error("Error:" + err);

				res.status(404);
				res.send('No calendar');
			} else if (!calendar){
				logger.error("Could not find calendar with id " + id);

				res.status(404);
				res.send('No calendar');
			} else {
				showEvent(req, res, calendar, -1);
			}
		});
	} else {
		logger.error("Could not find calendar with id " + id);

		res.status(404);
		res.render('404-calendar.html');
	}
}

function updateSelectableDates(req, res){
	if (req.route.params[0] == "example"){
		res.send(200);		
	} else {
		Calendar.findCalendarByAttendeeId(req.route.params[0], function(err, calendar, attendee){
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
				var selectableChoices = JSON.parse(req.body.dates);

				calendar.setSelectableDates(selectableChoices);

				res.send(200);
			}
		});
	}	
}

function updateDetails(req, res){
	if (req.route.params[0] == "example"){
		res.send(200);		
	} else {
		Calendar.findCalendarByAttendeeId(req.route.params[0], function(err, calendar, attendee){
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
				calendar.setDetails(req.body.description, req.body.venue);

				res.send(200);
			}
		});
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
	if (req.route.params[0] == "example"){
		res.redirect('/event/example');
	} else if (req.route.params[0].length == 5 || req.route.params[0].length == 9){
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
				var newAttendeeName = req.body.name;

				logger.info("Adding '" + newAttendeeEmail + "'' to: " + calendar.name);

				var newAttendee = calendar.addAttendee(newAttendeeEmail, attendee.prettyName, newAttendeeName, function(){
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
				var newAttendeeName = req.body.name;

				logger.info("Registering '" + newAttendeeEmail + "'' to: " + calendar.name);

				var newAttendee = calendar.addAttendee(newAttendeeEmail, "", newAttendeeName, function(){
					global.app.render('mail/adding-yourself-to-event.txt', {
						calendar: calendar
					}, function(err, message){
						Mail.sendMailToAttendee(calendar, newAttendee, calendar.name, message, "");
					});
					
					Mail.sendShareLinkToAttendee(calendar, newAttendee);

					calendar.updateCalendar(newAttendee, [], req.body.isFree.split(','));

					res.redirect('/event/' + newAttendee.attendeeId + '/calendar');
				});
			}
		});
	}
}

function updateAttendeeName(req, res){
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
				var newAttendeeName = req.body.name;

				logger.info("Calendar '" + calendar.name + " updating '" + attendee.email + "' name to " + newAttendeeName);

				attendee.name = newAttendeeName;

				calendar.save(function(err, att){
					if (err){
						logger.error("Failed to save attendee name change: " + err);

						res.redirect('/event/' + attendee.attendeeId);
					} else {

						res.redirect('/event/' + attendee.attendeeId);
						logger.info("Calendar '" + calendar.name + " updated '" + attendee.email + "' name to " + newAttendeeName);
					}
				});
			}
		});
	} else if (req.route.params[0] == "example"){
		res.redirect('/event/example');
	}
}

function removeAttendee(req, res){
	console.log(req.route.params);

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
				var attendeeToRemove = calendar.findAttendee(req.route.params[1]);

				if (attendeeToRemove != null){
					calendar.removeAttendee(attendeeToRemove);

					logger.info("Calendar '" + calendar.name + "' removed attendee '" + attendeeToRemove.email + "'");
				} else {
					logger.error("Could not find attendeeId: " + req.route.params[1] + " in calendarId: " + calendar.calendarId);
				}

				res.send(200);		
			}
		});
	} else if (req.route.params[0] == "example"){
		res.send(200);		
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

exports.updateAttendeeName = function(req, res){
	updateAttendeeName(req, res);
};

exports.updateSelectableDates = function(req, res){
	updateSelectableDates(req, res);
};

exports.updateDetails = function(req, res){
	updateDetails(req, res);
};

exports.removeAttendee  = function(req, res){
	removeAttendee(req, res);
};



