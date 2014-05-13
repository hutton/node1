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
		selectable: {type: Boolean, default: true},
		busy: [mongoose.SchemaType.ObjectId],
		free: [mongoose.SchemaType.ObjectId]
	}],
	datesSelected: {type: Boolean, default: true},
	everythingSelectable: {type: Boolean, default: true},

	createdBy: { type: String, default: "" },
	attendees: [AttendeeSchema],
	date: { type: Date, default: Date.now },
	calendarId: {
		type: String,
		index: true
	}
});

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

var f = 4;

function findNewCalendarId(callback){
	var tryId = makeId(6);

	Calendar.findOne({"calendarId": tryId}, function(err, calendar){
		console.log(calendar);
		if (err){
			logger.error(err);
			return;
		} else if (calendar === null){
			callback(tryId);
		} else {
			findNewCalendarId(callback);
		}
	});
}

function makeValidCalendarId(name){
	name = name.replace(/[+| ]/g,"-");
	name = name.replace(/[^a-zA-Z0-9_-]/g, "");
	name = name.replace(/-+/g, "-");

	return name;
}

function createCalendar(subject, choices, from, callback){
	// Need to check for dups
	var id = subject.toLowerCase();

	id = makeValidCalendarId(id);

	var newCalendar = new Calendar({
		id: id,
		name: subject,
		choices: choices,
		createdBy: from,
		datesSelected: false,
		everythingSelectable: false
	});

	findNewCalendarId(function(newId){
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

			newCalendar.calendarId = newId;
			newCalendar.id = tryId;

			newCalendar.save(function(err, calendar){
				if (err){
					logger.error("Failed to create calendar: " + err);
				} else {
					logger.info("New Calendar " + calendar.name + "(" + calendar.id + ") saved.");

					Mail.sendTextMail(global.app.ourEmail, global.app.ourEmail ,"New calender: " + calendar.name, "New calendar created http://convenely.com/event/" + calendar.calendarId);
				}
			});

			callback(newCalendar);
		});
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

CalendarSchema.statics.newCalendar = function(from, fromName, subject, message, callback){
	var dates =  createDates(0);

	var choices = _.map(dates, function(date){

		// Should be new
		return {
			date: date,
			busy: [],
			free:[]
		};
	});

	var splitMessage = Mail.getEmailAddressesAndBody(message);

	var attendeeAddresses = splitMessage[0];
	var name = "";

	attendeeAddresses.push(from);

	attendeeAddresses = _.uniq(attendeeAddresses);

	createCalendar(subject, choices, from, function(newCalendar){
		logger.info("Calendar saved: " + newCalendar.id);

		_.each(attendeeAddresses, function(address){
			name = "";

			if (address == from){
				name = fromName;
			}

			var newAttendee = new Attendee({
				name: name,
				email: address,
				attendeeId: newCalendar.calendarId + findNewAttendeeId(newCalendar)
			});

			newCalendar.attendees.push(newAttendee);
		});

		newCalendar.save(function(err, calendar){
			if (err){
				logger.error("Failed to save calendar: " + err);
			} else {
				logger.info("Attendees added to new calendar " + calendar.name + "(" + calendar.id + ") saved.");
			};

			callback(newCalendar);
		});
	});
};

CalendarSchema.statics.findCalendar = function(id, callback){
	var calendarId = id; // strip rest of address

	Calendar.findOne({id: calendarId}, callback);
};

CalendarSchema.statics.findCalendarByAttendeeId = function(id, callback){
	Calendar.findOne({"attendees.attendeeId": id}, function(err, calendar){
		if (err){
			logger.error(err);

			callback(err, null, null);
			return;
		} else if (calendar === null){
			callback(err, null, null);
			return;
		}

		// find attendee
		var attendee = _.find(calendar.attendees, function(attendee){
			return attendee.attendeeId == id;
		});

		calendar.checkForDuplicateChoices();

		callback(err, calendar, attendee);
	});
};

CalendarSchema.statics.findCalendarByCalendarId = function(id, callback){
	Calendar.findOne({"calendarId": id}, function(err, calendar){
		if (err){
			logger.error(err);

			callback(err, null, null);
			return;
		} else if (calendar === null){
			callback(err, null, null);
			return;
		}

		calendar.checkForDuplicateChoices();

		callback(err, calendar);
	});
};

CalendarSchema.methods.findChoiceByDate = function(date){
	var dateString = new Date(date).toDateString();

	if (dateString !== "Invalid Date"){
		var found = _.find(this.choices, function(choice){
			if (choice.date !== null && !_.isUndefined(choice.date) && dateString === choice.date.toDateString()){
				return choice;
			}
		});

		if (_.isUndefined(found)){
			return null;
		}

		return found;
	}

	return null;
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

CalendarSchema.methods.checkForDuplicateChoices = function(){
	var that = this;

	var sortedChoices = _.sortBy(this.choices, function(choice){
		return choice.date;
	});

	var prevDate = null;
	var prevChoice = null;

	var dupFound = false;

	_.each(sortedChoices, function(choice){
		if (choice.date !== null ){
			var choiceDate = choice.date.toDateString();

			if (choiceDate === prevDate){
				dupFound = true;

				logger.error("Found duplicate date (" + choiceDate + ") for calendar " + that.name );
				logger.error("Choice    : " + choice );
				logger.error("PrevChoice: " + prevChoice );

				_.each(choice.free, function(free){
					prevChoice.free.push(free);
				});

				prevChoice.free = _.unique(prevChoice.free);

				that.choices.removeElement(choice);

				logger.error("Merged choice: " + prevChoice );
			}

			prevDate = choiceDate;
			prevChoice = choice;
		}
	});

	if (dupFound){
		this.save(function(err){
			if (err){
				logger.error(err);
			} else {
				logger.info("Calendar saved");
			}
		});
	}
};

CalendarSchema.methods.updateChoice = function(attendee, date, freeAttendees){
	var that = this;

	var isFree = freeAttendees.indexOf(attendee._id.toString()) != -1;

	var foundChoice = this.findChoiceByDate(date);

	if (_.isUndefined(foundChoice) || foundChoice === null){
		if (isFree){
			var newChoice = {
						date: date,
						busy: [],
						free:[attendee._id]
					};

			this.choices.push(newChoice);
		}
	} else {
		if (isFree){
			var isFound = false;
			
			for (var i = 0; i < foundChoice.free.length; i++){
				if ( foundChoice.free[i].equals(attendee._id)){
					isFound = true;
					break;
				}
			}
			
			// Don't want to add it twice!
			if (!isFound){
				foundChoice.free.push(attendee._id);
			}
			
		} else {
			for (var i = 0; i < foundChoice.free.length; i++){
				if ( foundChoice.free[i].equals(attendee._id)){
					foundChoice.free.splice(i,1);
					break;
				}
			}
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

CalendarSchema.methods.addAttendeeMessage = function(message, fromName){
	var splitMessage = Mail.getEmailAddressesAndBody(message);

	var attendeeAddresses = splitMessage[0];
	var name = "";
	var calendar = this;

	attendeeAddresses = _.uniq(attendeeAddresses);

	var attendees = _.map(attendeeAddresses, function(address){
		name = "";

		var newAttendee = new Attendee({
			name: name,
			email: address,
			attendeeId: calendar.calendarId + findNewAttendeeId(calendar)
		});

		calendar.attendees.push(newAttendee);

		return newAttendee;
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

CalendarSchema.methods.setSelectableDates = function(dates){
	var calendar = this;

	_.each(calendar.choices, function(choice){
		choice.selectable = false;
	});

	var newChoices = [];

	_.each(dates, function(date){
		var choice = calendar.findChoiceByDate(date);

		if (choice !== null){
			choice.selectable = true;
		} else {
			calendar.choices.push({
						date: date,
						selectable: true,
						busy: [],
						free:[]
					});
		}
	});

	calendar.datesSelected = true;

	calendar.save(function(err, calendar){
		if (err){
			logger.error("Failed to set selectable dates calendar: " + err);
		} else {
			logger.info("Selectable dates updated for calendar " + calendar.name + "(" + calendar.id + ").");
		}
	});
};

function findNewAttendeeId(calendar){
	var matches = true;
	var tryId;

	while (matches){
		matches = false;
		tryId = makeId(3);

		_.each(calendar.attendees, function(attendee){
			if (attendee.attendeeId == tryId){
				matches = true;
			}
		});
	}

	return tryId;
}

CalendarSchema.methods.addAttendee = function(address, fromName, name, savedCallback){
	var calendar = this;

	var attendee = new Attendee({
			name: name,
			email: address,
			attendeeId: calendar.calendarId + findNewAttendeeId(calendar)
		});

	calendar.attendees.push(attendee);

	calendar.save(function(err, calendar){
		if (err){
			logger.error("Failed to add attendee calendar: " + err);
		} else {
			logger.info("Attendee added to calendar " + calendar.name + "(" + calendar.id + ") saved.");
		}

		savedCallback();
	});

	return attendee;
};

CalendarSchema.methods.removeAttendeeMessage = function(message){
	var splitMessage = Mail.getEmailAddressesAndBody(message);

	var attendeeAddresses = splitMessage[0];
	var name = "";
	var calendar = this;

	attendeeAddresses = _.uniq(attendeeAddresses);

	_.each(attendeeAddresses, function(attendeeAddress){
		var attendee = calendar.getAttendeeFromAddress(attendeeAddress);

		if (attendee !== null){
			removeAttendeeAvailabiltyFromCalendar(calendar, attendee);
		}
	});

	calendar.save(function(err, calendar){
		if (err){
			logger.error("Failed to create calendar: " + err);
		} else {
			logger.info("Removed attendees Calendar " + calendar.name + "(" + calendar.id + ") saved.");
		}
	});
};

CalendarSchema.methods.removeAttendee = function(attendee){
	var name = "";
	var calendar = this;

	if (attendee !== null){
		removeAttendeeAvailabiltyFromCalendar(calendar, attendee);
	}

	calendar.save(function(err, calendar){
		if (err){
			logger.error("Failed to create calendar: " + err);
		} else {
			logger.info("Removed '" + attendee.email + "'' Calendar " + calendar.name + "(" + calendar.id + ") saved.");
		}
	});
};

function removeAttendeeAvailabiltyFromCalendar(calendar, attendee){

	for (var c = 0; c < calendar.choices.length; c++){
		var choice = calendar.choices[c];

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
	}

	var a = calendar.attendees.indexOf(attendee);

	calendar.attendees.splice(a,1);
}

var Calendar = mongoose.model('Calendar', CalendarSchema);

module.exports = {
	Calendar: Calendar
};
