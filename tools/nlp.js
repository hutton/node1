var _ = require("underscore");

var natural = require("natural");
var moment = require("moment");
var logger = require("../tools/logger");

var classifier = new natural.BayesClassifier();

function train(){
	logger.info("Training NLP");

	classifier.addDocument("i can do any dddd.", 'free');
	classifier.addDocument("i'm free on dddd.", 'free');
	classifier.addDocument("dddd are no good for me dddd.", 'busy');
	classifier.addDocument("i'm not free on any dddd.", 'busy');
	classifier.addDocument("i can only do dddd", 'free');

	classifier.train();
}

train();

function processBody2(calendar, body){
	classifier.classify(body);
}

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