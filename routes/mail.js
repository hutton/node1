
var SendGrid = require('sendgrid-nodejs');
var fs = require('fs');

exports.show = function(req, res){
  res.render('mail');
};

exports.send = function(req, res){
	console.log("Mail send");

	console.log(req.body.to);

	fs.readFile(__dirname + '/../views/test-mail.html', 'utf8', function (err, data) {
		if (err) {
			throw err;
		}

	  	// console.log(data)
	  	sendMail(req.body.to, req.body.from, req.body.subject, data);
	});

  	res.render('mail', { title: 'Mail sent' });
};

function sendMail(to, from, subject, body){
	var mail = new SendGrid.Email({
	    to: req.body.to,
	    from: req.body.from,
	    subject: req.body.subject,
	    html: data
	});

	var sender = new SendGrid.SendGrid('azure_18f15c117d3bbf0ffd99b5f44d934396@azure.com','ifpn5yay');

	sender.send(mail, function(success, err){
	    if(success) 
	    	console.log('Email sent');
	    else 
	    	console.log(err);
	});
}