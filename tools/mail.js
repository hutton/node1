
var _ = require("underscore");
var SendGrid = require('sendgrid-nodejs');

var sendGridUser = 'azure_18f15c117d3bbf0ffd99b5f44d934396@azure.com'
var sendGridPassword = 'ifpn5yay'

function sendMail(calendar, subject, from, message){
	console.log("Sending mail to group: " + calendar.id );

	var sender = new SendGrid.SendGrid(sendGridUser,sendGridPassword);

	_.each(calendar.attendees, function(attendee){
		global.app.render('basic', {
			subject: subject, 
			message: message
		}, function(err, html){

			console.log("Sending mail to: " + attendee.email );

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
		});
	});
}

module.exports = {
	sendMail: sendMail
}