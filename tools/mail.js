
var _ = require("underscore");
var moment = require("moment");
var SendGrid = require('sendgrid-nodejs');

var sendGridUser = 'azure_18f15c117d3bbf0ffd99b5f44d934396@azure.com'
var sendGridPassword = 'ifpn5yay'

function sendMail(calendar, subject, from, message){
	console.log("Sending mail to group: " + calendar.id );

	var sender = new SendGrid.SendGrid(sendGridUser,sendGridPassword);

	_.each(calendar.choices, function(choice){
		choice.columnDate = moment(choice.date).format("dddd</br>Do MMM");
	});

	_.each(calendar.attendees, function(attendee){
		global.app.render('basic-web.html', {
			choices: calendar.choices,
			attendees: calendar.attendees,
			subject: subject, 
			message: message
		}, function(err, html){

			if (err){
				console.log(err);
			}

			console.log("Sending mail to: " + attendee.email );

			try{
				var mail = new SendGrid.Email({
					to: attendee.email,
					from: from,
					subject: subject,
					html: html
				});

				sender.send(mail, function(success, err){
					if(success) 
						console.log('Email sent to: ' + attendee.email);
					else 
						console.log(err);
				});
	        } catch (e){
	        	console.log("Failed to send email to: " + mail.to);
	        	console.log(e);
	        }
		});
	});
}

module.exports = {
	sendMail: sendMail
}