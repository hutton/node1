
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
	Calendar.findCalendar(req.route.params[0], function(err, calendar){
		if (err){
			logger.error("Error finding calendar " + req.route.params[0]);
			logger.error("Error:" + err);

			res.send('No calendar');
		} else if (!calendar){
			logger.error("Could not find calendar " + req.route.params[0]);

			res.send('No calendar');
		} else {

			Mail.renderEmail(calendar, format, res);
		}
	});
}

exports.viewText = function(req, res){
	renderCalendar(req, res, "text");
};

exports.view = function(req, res){
	renderCalendar(req, res, "html");
};

