
/*
 * GET users listing.
 */

 require("../models/attendee");
 var Calendar = require("../models/calendar").Calendar;
 
 var moment = require("moment");
 var mongoose = require("mongoose");
 var _ = require("underscore");

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

 	console.log("Create new calendar: " + id);

 	var newCalendar = new Calendar({name: id});

 	newCalendar.save(function(err){
 		if (err){
 			console.log(err);
 		}
 	});

 	console.log("Calendar saved: " + newCalendar.id);

	// Create calendar and redirect
	res.redirect('/' + id);	
};


exports.view = function(req, res){
	Calendar.findCalendar(req.route.params[0], function(err, calendar){
		if (err || calendar == null){
			res.send('No calendar');
		} else {
			_.each(calendar.choices, function(choice){
				choice.columnDate = moment(choice.date).format("dddd</br>Do MMM");
			});

			console.log("Showing: " + calendar.name);

			res.render('basic-web.html', { message: calendar.name,
				attendees: calendar.attendees,
				choices: calendar.choices });
		}
	});
};