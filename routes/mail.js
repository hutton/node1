
var SendGrid = require('sendgrid-nodejs');
var fs = require('fs');
var Calendar = require("../models/calendar").Calendar;
var _ = require("underscore");

var Mail = require("../tools/mail");
var Nlp = require("../tools/nlp");

exports.show = function(req, res){
	res.render('mail.html');
};

function startsWith(input, query){
	return input.substr(0,query.length) === query;
}

function getLocalPartOfEmail(address){
	return address.split("@")[0];
}

function extractMessage(fullMessage){
	return fullMessage;
}

exports.receive = function(req, res){
	console.log("Mail received");

	var message = extractMessage(req.body.message);

	if (startsWith(req.body.to, "start@")){
		var newCalendar = Calendar.newCalendar(req.body.to, req.body.from, req.body.subject, message, function(newCalendar){
			res.redirect('/calendar/' + newCalendar.id);	
		});
	} else {

		var localEmail = getLocalPartOfEmail(req.body.to);

		var calendar = Calendar.findCalendar(localEmail, function(err, calendar){
			if (err && calendar != null){
				res.send('No calendar');
			} else {
				var fromAttendee = calendar.getAttendeeFromAddress(req.body.from);

				var dates = Nlp.processBody(calendar, message);

				if (fromAttendee != null){
					calendar.updateCalendar(fromAttendee, 
						dates[0], 
						dates[1]);

					Mail.sendMail(calendar, req.body.subject, req.body.message);
				} else {
					console.log("Couldn't find " + req.body.from + " in calendar " + calendar.name);
				}
			}
		});
	}

	res.render('mail', { title: 'Mail sent' });
};
