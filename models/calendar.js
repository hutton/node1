
var Attendee = require("../models/attendee").Attendee;
var AttendeeSchema = require("../models/attendee").AttendeeSchema;

var Mail = require("../tools/mail");

var mongoose = require("mongoose");
var moment = require("moment");
var _ = require("underscore");


var CalendarSchema = new mongoose.Schema({
	id: { 
		type: String, 
		index: true
	},
	name: {
		type: String,
		index: true
	},
	choices: [{	
		date: Date, 
		busy: [mongoose.SchemaType.ObjectId],
		free: [mongoose.SchemaType.ObjectId]
	}],
	attendees: [AttendeeSchema],
	date: { type: Date, default: Date.now }
});

function getEmailAddressesAndBody(text){
	var body = text;
 
	var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
 
	var result = text.match(re);
 
	if (result == null){
		return [[],body]
	}
 
	if (result.length > 0){
		var startIndex = body.indexOf(result[0]);
 
		if (startIndex != -1){
			body = body.substr(0,startIndex);
		}
	}
 
	return [result, body];
}

function createDates(numberOfDays){
	var now = new Date();

	var startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	return _.map(_.range(numberOfDays), function(num){
		var newDate = new Date(startDate);

		newDate.setDate(newDate.getDate() + num);
		
		return newDate;
	});
}

function saveCallback(err){
	if (err){
		console.log(err);
	}
}

function createCalendar(subject, choices, attendees, callback){
	// Need to check for dups
	var id = subject.replace(/ /g,"-").toLowerCase();

	var newCalendar = new Calendar({
		id: id,
		name: subject,
		choices: choices
	});	

	Calendar.find({id: new RegExp('^'+ newCalendar.id +'*', "i")}, 'id').exec(function(err, docs){
		var originalId = newCalendar.id
	    var tryId = originalId;
	    var count = 1;

	    while (true){
	        if (_.find(docs, function(doc){ return doc.id == tryId; }) == null){
	            break;
	        } else {
	            tryId = originalId + count++;
	        }
	    }

	    newCalendar.id = tryId;

		_.each(attendees, function(attendee){
			newCalendar.attendees.push(attendee);
		});

		newCalendar.save(function(err, calendar){
	        if (err){
	            console.log("Failed to create calendar: " + err);
	        } else {
	            console.log("New Calendar " + calendar.name + "(" + calendar.id + ") saved.");
	        }
	    });    

	    callback(newCalendar);
	});
}

CalendarSchema.statics.newCalendar = function(to, from, subject, message, callback){
	var dates =  createDates(0);

	var choices = _.map(dates, function(date){

		// Should be new
		return {
			date: date,
			busy: [],
			free:[] 
		};
	});

	var splitMessage = getEmailAddressesAndBody(message);

	var attendeeAddresses = splitMessage[0];
	var body = splitMessage[1];

	attendeeAddresses.push(from);

	attendeeAddresses = _.uniq(attendeeAddresses);

	var attendees = _.map(attendeeAddresses, function(address){
		return new Attendee({
			name: "",
			email: address
		})
	});

	createCalendar(subject, choices, attendees, function(newCalendar){
		Mail.sendMail(newCalendar, subject, body);

		console.log("Calendar saved: " + newCalendar.id);

		callback(newCalendar);
	});
}

function ___update(){
	var choice = newCalendar.choices[0];

	console.log(choice);

	choice.busy.push(newAttendee);
}

CalendarSchema.statics.findCalendar = function(id, callback){

	var calendarId = id; // strip rest of address

	Calendar.findOne({id: calendarId}, callback);
}

CalendarSchema.methods.updateCalendar = function(attendee, busyDates, freeDates){
	console.log("Updating calendar");

	var self = this;

	console.log(attendee.email + " is busy on " + busyDates);
	console.log(attendee.email + " is free on " + freeDates);

	var choices = this.choices;

	_.each(busyDates, function(busyDate){
		console.log("Looking for " + busyDate + " in " + choices);

		var foundChoice = _.find(choices, function(choice){
			if (moment(choice.date).diff(moment(busyDate), "days") == 0){
				return choice;
			};
		});

		if (foundChoice != null){
			var found = _.find(foundChoice.busy, function(att){
				if (att.equals(attendee._id)){
					return att;
				}
			});

			if (found == null){
				foundChoice.busy.push(attendee._id);
			}

			for (var i = 0; i < foundChoice.free.length; i++){
				if ( foundChoice.free[i].equals(attendee._id)){
					foundChoice.free.splice(i,1);	
					break;
				}
			}
		} else {
			var newChoice = {
						date: busyDate,
						busy: [attendee._id],
						free:[] 
					};

			choices.push(newChoice);
		}
	});

	_.each(freeDates, function(freeDate){
		var foundChoice = _.find(choices, function(choice){
			if (moment(choice.date).diff(moment(freeDate), "days") == 0){
				return choice;
			};
		});

		if (foundChoice != null){

			console.log("looking for " + foundChoice.free + " in " + attendee._id);
			var found = _.find(foundChoice.free, function(att){
				if (att.equals(attendee._id)){
					return att;
				}
			});

			if (found == null){
				console.log("add to free " + found);
				foundChoice.free.push(attendee._id);
			}

			for (var i = 0; i < foundChoice.busy.length; i++){
				if ( foundChoice.busy[i].equals(attendee._id)){
					foundChoice.busy.splice(i,1);	
					break;
				}
			}
		} else {
			var newChoice = {
						date: freeDate,
						busy: [],
						free:[attendee._id] 
					};

			choices.push(newChoice);
		}
	});

	// _.each(this.choices, function(choice){
	// 	var index = _.indexOf(busyDate, choice.date);

	// 	if (index != -1){

	// 		choice.busy.push(attendee._id);

	// 		var found = _.indexOf(choice.free, attendee);

	// 		if (found != -1){
	// 			choice.free[found].remove();
	// 		}
	// 	} else {
	// 		console.log("Couldn't find date, adding it");

	// 		var newChoice = {
	// 					date: date,
	// 					busy: [attendee],
	// 					free:[] 
	// 				};

	// 		choices.push(newChoice);
	// 	}

	// 	index = _.indexOf(freeDate, choice.date);

	// 	if (index != -1){

	// 		choice.free.push(attendee._id);

	// 		var found = _.indexOf(choice.busy, attendee);

	// 		if (found != -1){
	// 			choice.busy[found].remove();
	// 		}
	// 	} else {
	// 		var newChoice = {
	// 					date: date,
	// 					busy: [],
	// 					free:[attendee] 
	// 				};

	// 		choices.push(newChoice);
	// 	}
	// });

	this.save(function(err){
		if (err){
			console.log(err);
		} else {
			console.log("Calendar saved")
		}
	});
}

CalendarSchema.methods.getAttendeeFromAddress = function(address){
	return _.find(this.attendees, function(attendee){

		if (attendee.email == address){
			return attendee;
		}
	});
}

var Calendar = mongoose.model('Calendar', CalendarSchema);

module.exports = {
	Calendar: Calendar
}