
/*
 * GET users listing.
 */

require("../models/attendee");
var Calendar = require("../models/calendar").Calendar;

var moment = require("moment");
var mongoose = require("mongoose");
var _ = require("underscore");
var logger = require("../tools/logger");
var datesHelper = require("../tools/dates");
var Mail = require("../tools/mail");
var Example = require("../tools/example");

 function makeid(length)
 {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < length; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
 }

 exports.new = function(req, res){
	var id = makeid(10);

	logger.info("Create new calendar: " + id);

	var newCalendar = new Calendar({name: id});

	newCalendar.save(function(err){
		if (err){
			logger.error(err);
		}
	});

	logger.info("Calendar saved: " + newCalendar.id);

	// Create calendar and redirect
	res.redirect('/' + id);	
};

function renderCalendar(req, res, format){
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
				Mail.renderEmail(calendar, format, res);
			}
		});
	} else if (req.route.params[0] == 'example') {
		var calendar = Example.getExample();

		Mail.renderEmail(calendar, format, res);
	}
	else {
		res.status(404);
		res.send("We can't find the event you're looking for.")
	}
}

exports.viewText = function(req, res){
	renderCalendar(req, res, "text");
};

exports.view = function(req, res){
	renderCalendar(req, res, "html");
};

