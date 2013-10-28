
require("../models/attendee");
var Calendar = require("../models/calendar").Calendar;

var moment = require("moment");
var mongoose = require("mongoose");
var _ = require("underscore");
var logger = require("../tools/logger");

function renderEvent(req, res){

	Calendar.findCalendarByAttendeeId(req.route.params[0], function(err, calendar, attendee){
		if (err){
			logger.error("Error finding calendar " + req.route.params[0]);
			logger.error("Error:" + err);

			res.send('No calendar');
		} else if (!calendar){
			logger.error("Could not find calendar " + req.route.params[0]);

			res.send('No calendar');
		} else {
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
					me: att._id == attendee._id
				});
			});

			logger.info("Showing: " + calendar.name);

			var sortedChoices = _.sortBy(calendar.choices, function(choice){
				return choice.date;
			});
			res.render('event2.html', {
				choices: JSON.stringify(sortedChoices),
				attendees: JSON.stringify(cleanedAttendees)
			});
		}
	});
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

			if (_.isUndefined(postedChoice._id)){
				logger.info("A new choice");				
			} 

			res.status(200);
		}		
	});
}

exports.view = function(req, res){
	renderEvent(req, res);
};

exports.updateChoice = function(req, res){
	updateChoice(req, res);
};
