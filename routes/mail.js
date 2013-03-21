
var SendGrid = require('sendgrid-nodejs');
var fs = require('fs');
var Calendar = require("../models/calendar").Calendar;

exports.show = function(req, res){
	res.render('mail');
};

function startsWith(input, query){
	return input.substr(0,query.length) === query;
}

exports.receive = function(req, res){
	console.log("Mail send");

	if (startsWith(req.body.to, "start")){
		Calendar.newCalendar(req.body.to, req.body.from, req.body.subject, req.body.message);
	} else {
		var calendar = Calendar.findCalendar(req.body.to);
	}

	// console.log(req.body.to);

	// fs.readFile(__dirname + '/../views/basic.html', 'utf8', function (err, data) {
	// 	if (err) {
	// 		throw err;
	// 	}

	//   	// console.log(data)
	//   	sendMail(req.body.to, req.body.from, req.body.subject, data);
	// });

res.render('mail', { title: 'Mail sent' });
};

function sendMail(to, from, subject, body){
	var mail = new SendGrid.Email({
		to: to,
		from: from,
		subject: subject,
		html: body
	});

	var sender = new SendGrid.SendGrid('azure_18f15c117d3bbf0ffd99b5f44d934396@azure.com','ifpn5yay');

	sender.send(mail, function(success, err){
		if(success) 
			console.log('Email sent');
		else 
			console.log(err);
	});
}