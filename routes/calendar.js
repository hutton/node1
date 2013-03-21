
/*
 * GET users listing.
 */

 var Calendar = require("../models/calendar").Calendar;

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
	res.send("Viewing calendar");
};