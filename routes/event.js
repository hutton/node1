
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

			_.each(calendar.attendees, function(attendee){
				attendee.prettyName = attendee.name || attendee.email;
			});

			logger.info("Showing: " + calendar.name);

			var sortedChoices = _.sortBy(calendar.choices, function(choice){
				return choice.date;
			});
			res.render('event2.html', {
				attendee: attendee,
				calendar: JSON.stringify(calendar),
				choices: JSON.stringify(sortedChoices),
				attendees: JSON.stringify(calendar.attendees),
				message: ''
			});
		}
	});
}

exports.view = function(req, res){
	renderEvent(req, res);
};
