var Attendee = require("../models/attendee").Attendee;
var AttendeeSchema = require("../models/attendee").AttendeeSchema;

var Mail = require("../tools/mail");

var mongoose = require("mongoose");
var moment = require("moment");
var _ = require("underscore");
var logger = require("../tools/logger");

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
	createdBy: { type: String, default: "" },
	attendees: [AttendeeSchema],
	date: { type: Date, default: Date.now }
});

function getEmailAddressesAndBody(text){
	var body = text;
 
	var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
 
	var result = text.match(re);
 
	if (result === null){
		return [[],body];
	}
 
	if (result.length > 0){
		var startIndex = body.indexOf(result[0]);
 
		if (startIndex != -1){
			body = body.substr(0,startIndex);
		}

		for (var i=0; i < result.length; i++) {
			result[i] = result[i].trim().toLowerCase();
			result[i] = result[i].replace(/[^a-z0-9 @.-]/ig, '');
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
		logger.error(err);
	}
}

function createCalendar(subject, choices, attendees, from, callback){
	// Need to check for dups
	var id = subject.replace(/ /g,"-").toLowerCase();

	var newCalendar = new Calendar({
		id: id,
		name: subject,
		choices: choices,
		createdBy: from
	});

	Calendar.find({id: new RegExp('^'+ newCalendar.id +'*', "i")}, 'id').exec(function(err, docs){
		var originalId = newCalendar.id;
		var tryId = originalId;
		var count = 1;

		while (true){
			var found = _.find(docs, function(doc){ return doc.id == tryId; });

			if (found === null || _.isUndefined(found)){
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
				logger.error("Failed to create calendar: " + err);
			} else {
				logger.info("New Calendar " + calendar.name + "(" + calendar.id + ") saved.");
			}
		});

		callback(newCalendar);
	});
}

function makeId(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

CalendarSchema.statics.newCalendar = function(to, from, fromName, subject, message, callback){
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
	var name = "";

	attendeeAddresses.push(from);

	attendeeAddresses = _.uniq(attendeeAddresses);

	var attendees = _.map(attendeeAddresses, function(address){
		name = "";

		if (address == from){
			name = fromName;
		}

		return new Attendee({
			name: name,
			email: address,
			attendeeId: makeId(5)
		});
	});

	createCalendar(subject, choices, attendees, from, function(newCalendar){
		Mail.sendMail(newCalendar, subject, body, fromName);

		logger.info("Calendar saved: " + newCalendar.id);

		callback(newCalendar);
	});
};

CalendarSchema.statics.findCalendar = function(id, callback){
	var calendarId = id; // strip rest of address

	Calendar.findOne({id: calendarId}, callback);
};

CalendarSchema.statics.findCalendarByAttendeeId = function(id, callback){
	Calendar.findOne({"attendees.attendeeId": id}, function(err, calendar){
		// find attendee
		var attendee = _.find(calendar.attendees, function(attendee){
			return attendee.attendeeId == id;
		});

		callback(err, calendar, attendee);
	});
};

CalendarSchema.methods.findChoiceByDate = function(date){
	return _.find(this.choices, function(choice){
		if (moment(choice.date).diff(moment(date), "days") === 0){
			return choice;
		}
	});
};

CalendarSchema.methods.updateCalendar = function(attendee, busyDates, freeDates){
	var self = this;

	logger.info(attendee.email + " is busy on " + busyDates);
	logger.info(attendee.email + " is free on " + freeDates);

	var choices = this.choices;

	_.each(busyDates, function(busyDate){

		var foundChoice = self.findChoiceByDate(busyDate);

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
		var foundChoice = self.findChoiceByDate(freeDate);

		if (foundChoice != null){

			var found = _.find(foundChoice.free, function(att){
				if (att.equals(attendee._id)){
					return att;
				}
			});

			if (found == null){
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

	this.save(function(err){
		if (err){
			logger.error(err);
		} else {
			logger.info("Calendar saved");
		}
	});
};

CalendarSchema.methods.updateChoice = function(attendee, date, freeAttendees){
	var isFree = freeAttendees.indexOf(attendee._id.toString()) != -1;

	logger.info("isFree:" + isFree);

	var foundChoice = this.findChoiceByDate(date);

	logger.info("foundChoice:" + foundChoice);

	if (foundChoice !== null){
		if (isFree){
			foundChoice.free.push(attendee._id);
		} else {
			for (var i = 0; i < foundChoice.free.length; i++){
				if ( foundChoice.free[i].equals(attendee._id)){
					foundChoice.free.splice(i,1);
					break;
				}
			}
		}
	} else {
		if (isFree){
			var newChoice = {
						date: date,
						busy: [],
						free:[attendee._id]
					};

			this.choices.push(newChoice);
		}
	}

	this.save(function(err){
		if (err){
			logger.error(err);
		} else {
			logger.info("Calendar saved");
		}
	});
};

CalendarSchema.methods.getAttendeeFromAddress = function(address){
	return _.find(this.attendees, function(attendee){

		if (attendee.email == address){
			return attendee;
		}
	});
};

CalendarSchema.methods.addAttendee = function(message, fromName){
	var splitMessage = getEmailAddressesAndBody(message);

	var attendeeAddresses = splitMessage[0];
	var name = "";
	var calendar = this;

	attendeeAddresses = _.uniq(attendeeAddresses);

	var attendees = _.map(attendeeAddresses, function(address){
		name = "";

		return new Attendee({
			name: name,
			email: address,
			attendeeId: makeId(5)
		});
	});

	_.each(attendees, function(attendee){
		calendar.attendees.push(attendee);
	});

	calendar.save(function(err, calendar){
		if (err){
			logger.error("Failed to create calendar: " + err);
		} else {
			_.each(attendees, function(attendee){
				Mail.sendMailToAttendee(calendar, attendee, calendar.name, "You've been added to the '" + calendar.name + "' email list.\n\nReply to this email with when you're available.", fromName);
			});

			logger.info("Attendee added to calendar " + calendar.name + "(" + calendar.id + ") saved.");
		}
	});
};

CalendarSchema.methods.removeAttendee = function(message){
	var splitMessage = getEmailAddressesAndBody(message);

	var attendeeAddresses = splitMessage[0];
	var name = "";
	var calendar = this;

	attendeeAddresses = _.uniq(attendeeAddresses);

	_.each(attendeeAddresses, function(attendeeAddress){
		var attendee = calendar.getAttendeeFromAddress(attendeeAddress);

		if (attendee !== null){
			_.each(calendar.choices, function(choice){
				for (var i = 0; i < choice.busy.length; i++){
					if ( choice.busy[i].equals(attendee._id)){
						choice.busy.splice(i,1);
						break;
					}
				}

				for (var j = 0; j < choice.free.length; j++){
					if ( choice.free[j].equals(attendee._id)){
						choice.free.splice(j,1);
						break;
					}
				}

				if (choice.busy.length === 0 && choice.free.length === 0){
					calendar.choices.splice(calendar.choices.indexOf(choice),1);
				}
			});

			var i = calendar.attendees.indexOf(attendee);

			calendar.attendees.splice(i,1);
		}
	});

	calendar.save(function(err, calendar){
		if (err){
			logger.error("Failed to create calendar: " + err);
		} else {
			logger.info("New Calendar " + calendar.name + "(" + calendar.id + ") saved.");
		}
	});
};

var Calendar = mongoose.model('Calendar', CalendarSchema);

module.exports = {
	Calendar: Calendar
};
