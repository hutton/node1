var _ = require("underscore");

var natural = require("natural");
var moment = require("moment");

function processBody(calendar, body){
	var busyDates = [];
	var freeDates = [];

	var freeMoment = moment().add({d:_.random(0,14)});
	var busyMoment = moment().add({d:_.random(0,14)});

	var freeDate = new Date(freeMoment.year(), freeMoment.month(), freeMoment.date());
	var busyDate = new Date(busyMoment.year(), busyMoment.month(), busyMoment.date());

	busyDates = [freeDate];
	freeDates = [busyDate];

	return [busyDates, freeDates];
}

module.exports = {
	processBody: processBody
}