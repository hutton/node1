var _ = require("underscore");

var natural = require("natural");

function processBody(calendar, body){
	var busyDates = [];
	var freeDates = [];

	busyDates = [calendar.choices[_.random(0,calendar.choices.length - 1)].date];
	freeDates = [calendar.choices[_.random(0,calendar.choices.length - 1)].date];

	return [busyDates, freeDates];
}

module.exports = {
	processBody: processBody
}