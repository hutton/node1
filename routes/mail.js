
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

function processEmailRequest(req, res, createCalendarCallback, updateCalendarCallback, error){
	console.log(req.body);

	var message = req.body.text;
	var to = Mail.getEmailAddresses(req.body.to)[0];
	var from = Mail.getEmailAddresses(req.body.from)[0];

	if (message != null){
		message = Mail.htmlMailToText(req.body.html);
	}

	if (startsWith(to, "start@")){
		var newCalendar = Calendar.newCalendar(to, from, req.body.subject, message, function(newCalendar){
			createCalendarCallback(newCalendar);
		});
	} else {
		var localEmail = getLocalPartOfEmail(to);

		var calendar = Calendar.findCalendar(localEmail, function(err, calendar){
			if (err || calendar == null){
				error('No calendar');
			} else {
				var fromAttendee = calendar.getAttendeeFromAddress(from);

				var dates = Nlp.processBody(calendar, message);

				if (fromAttendee != null){
					calendar.updateCalendar(fromAttendee, 
						dates[0], 
						dates[1]);

					Mail.sendMail(calendar, req.body.subject, message);
				} else {
					console.log("Couldn't find " + from + " in calendar " + calendar.name);
				}

				updateCalendarCallback(calendar);
			}
		});
	}
}

exports.sendGridReceive = function(req, res){
	console.log("Mail received from SendGrid");

	processEmailRequest(req, res, function(newCalendar){
		res.send( 200 );
	},
	function(calendar){
		res.send( 200 );
	},
	function(){
		res.send( 200 );
	});

}

exports.receive = function(req, res){
	console.log("Mail received from browser");

	processEmailRequest(req, res, function(newCalendar){
		res.redirect('/calendar/' + newCalendar.id);	
	},
	function(calendar){
		res.redirect('/calendar/' + calendar.id);	
	},
	function(message){
		res.send(message);
	});
};
