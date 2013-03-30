
var SendGrid = require('sendgrid-nodejs');
var fs = require('fs');
var Calendar = require("../models/calendar").Calendar;
var _ = require("underscore");

exports.show = function(req, res){
	res.render('mail.html');
};

function startsWith(input, query){
	return input.substr(0,query.length) === query;
}

function getLocalPartOfEmail(address){
	return address.split("@")[0];
}

exports.receive = function(req, res){
	console.log("Mail received");

	if (startsWith(req.body.to, "start")){
		var newCalendar = Calendar.newCalendar(req.body.to, req.body.from, req.body.subject, req.body.message);

		res.redirect('/calendar/' + newCalendar.id);	
	} else {

		var localEmail = getLocalPartOfEmail(req.body.to);

		var calendar = Calendar.findCalendar(localEmail, function(err, calendar){
			if (err){
				res.send('No calendar');
			}

			calendar.updateCalendar(calendar.attendees[0], 
				[calendar.choices[_.random(0,calendar.choices.length - 1)].date], 
				[calendar.choices[_.random(0,calendar.choices.length - 1)].date]);
		});
	}

	res.render('mail', { title: 'Mail sent' });
};