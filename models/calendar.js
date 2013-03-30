
var Attendee = require("../models/attendee").Attendee;
var AttendeeSchema = require("../models/attendee").AttendeeSchema;

var Mail = require("../tools/mail");

var mongoose = require("mongoose");
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

function getEmailAddresses(text){
	var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;

	var result = text.match(re);

	if (result == null){
		return []
	}
	
	return text.match(re);
}

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

function makeIdFromSubject(subject){
	// Need to check for dups
	var id = subject.replace(/ /g,"-").toLowerCase();

	Calendar.findOne({id: id}, function(err, calendar){

	});

	return id;
}

CalendarSchema.statics.newCalendar = function(to, from, subject, message){
	var id = makeIdFromSubject(subject);

	console.log("Creating new calendar: " + id);

	var dates =  createDates(14);

	var choices = _.map(dates, function(date){

		// Should be new
		return {
			date: date,
			busy: [],
			free:[] 
		};
	});

	var newCalendar = new Calendar({
		id: id,
		name: subject,
		choices: choices
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

	_.each(attendees, function(attendee){
		newCalendar.attendees.push(attendee);
	});

	newCalendar.save(saveCallback);

	Mail.sendMail(newCalendar, subject, to, body);

	console.log("Calendar saved: " + newCalendar.id);

	return newCalendar;
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

	_.each(this.choices, function(choice){
		var index = _.indexOf(busyDates, choice.date);

		if (index != -1){

			choice.busy.push(attendee._id);

			console.log("choice: " + choice);

			var found = _.indexOf(choice.free, attendee);

			if (found != -1){
				choice.free[found].remove();
			}
		}

		index = _.indexOf(freeDates, choice.date);

		if (index != -1){

			choice.free.push(attendee._id);

			var found = _.indexOf(choice.busy, attendee);

			if (found != -1){
				choice.busy[found].remove();
			}
		}
	});

	this.save(function(err){
		if (err){
			console.log(err);
		} else {
			console.log("Calendar saved")
		}
	});
}

var Calendar = mongoose.model('Calendar', CalendarSchema);

module.exports = {
	Calendar: Calendar
}