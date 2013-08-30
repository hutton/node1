 
/*
 * GET users listing.
 */

require("../models/attendee");
var Calendar = require("../models/calendar").Calendar;

var moment = require("moment");
var mongoose = require("mongoose");
var _ = require("underscore");
var logger = require("../tools/logger");

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
			_.each(calendar.choices, function(choice){
				choice.columnDate = moment(choice.date).format("dddd Do MMM");
			});

			_.each(calendar.attendees, function(attendee){
				attendee.prettyName = attendee.name || attendee.email;
			});

			logger.info("Showing: " + calendar.name);

			var sortedChoices = _.sortBy(calendar.choices, function(choice){
				return choice.date;
			});

			var attendee = calendar.attendees[0];

			if (format === "text"){
				res.render('calendar_view.txt', {
					attendee: attendee,
					calendar: calendar,
					choices: sortedChoices,
					attendees: calendar.attendees,
					message: ''
				});
			} else if (format === 'html'){
				res.render('responsive_view.html', {
					attendee: attendee,
					calendar: calendar,
					choices: sortedChoices,
					attendees: calendar.attendees,
					message: ''
				});
			}
		}
	});
}

exports.viewText = function(req, res){
	renderCalendar(req, res, "text");
}

exports.view = function(req, res){
	renderCalendar(req, res, "html");
}

