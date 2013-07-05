var _ = require("underscore");

var natural = require("natural");
var moment = require("moment");
var sugar = require("sugar");
var logger = require("../tools/logger");
var dateTools = require("../tools/dates");

var classifier = new natural.BayesClassifier();

function train(){
	logger.info("Training NLP");

	classifier.addDocument("i can do xxxx", 'free');
	classifier.addDocument("would be OK", 'free');
	classifier.addDocument("im free on xxxx", 'free');
	classifier.addDocument("i can only do xxxx", 'free');
	classifier.addDocument("xxxx would be OK", 'free-backwards');
	classifier.addDocument("xxxx works for me", 'free-backwards');
	classifier.addDocument("how about xxxx", 'free');
	classifier.addDocument("xxxx looks OK", 'free-backwards');
	classifier.addDocument("Ive got no plans for xxxx", 'free');
	classifier.addDocument("xxxx is best for me", 'free-backwards');
	classifier.addDocument("Shall we go for xxxx", 'free');
	classifier.addDocument("suggest", 'free');
	classifier.addDocument("xxxx might be OK", 'free-backwards');
	classifier.addDocument("can do xxxx", 'free');
	classifier.addDocument("xxxx is best for me", 'free-backwards');
	classifier.addDocument("Im in for xxxx", 'free');
	classifier.addDocument("xxxx anyone?", 'free-backwards');
	classifier.addDocument("I could do xxxx", 'free');
	classifier.addDocument("xxxx is a possibility", 'free-backwards');
	classifier.addDocument("xxxx anyone?", 'free-backwards');
	classifier.addDocument("I should be able to make xxxx", 'free');
	classifier.addDocument("xxxx is good for me", 'free-backwards');

	classifier.addDocument("would not be OK", 'busy');
	classifier.addDocument("i cant do xxxx", 'busy');
	classifier.addDocument("xxxx are no good for me", 'busy-backwards');
	classifier.addDocument("xxxx isnt great", 'busy-backwards');
	classifier.addDocument("i cant do xxxx", 'busy');
	classifier.addDocument("cant make xxxx", 'busy');
	classifier.addDocument("wont be able to make xxxx", 'busy');
	classifier.addDocument("I cant do xxxx", 'busy');
	classifier.addDocument("Im away xxxx", 'busy');
	classifier.addDocument("cant do xxxx", 'busy');
	classifier.addDocument("cant make it xxxx", 'busy');
	classifier.addDocument("xxxx is bad", 'busy-backwards');
	classifier.addDocument("busy on xxxx", 'busy');
	classifier.addDocument("cant make it on xxxx", 'busy');
	classifier.addDocument("im busy xxxx", 'busy');

	// classifier.addDocument("xxxx except xxxx", 'flip');

	classifier.train();
}

train();

function blankMatches(text, matches){
	if (matches.length == 0){
		return text;
	}

	var chars = text.chars();

	var string = "";
	var matchIndex = 0;

	var match = matches[matchIndex];
	var finished = false;

	for (var charIndex=0; charIndex < chars.length; charIndex++){
		if (!finished && charIndex >= match.index){
			string += "_";

			while (charIndex >= (match.index + match.match.length - 1)){					
				matchIndex++;

				if (matchIndex > matches.length - 1){
					finished = true;
					break;
				}

				match = matches[matchIndex];
			}
		} else {
			string += chars[charIndex];
		}
	}

	return string;
}

// Simple dates e.g. 1st, 22nd 
function simpleDate(text){
  var re = /[0-9]{1,2}(th|rd|st|nd)/g
 
	var result;
	var matches = [];
 
	while((result = re.exec(text)) !== null){
		var match = {
			match: result[0],
			date: Date.future(result[0]),
			index: result.index
		};
 
		matches.push(match);
	}
 
	return matches;
}

function formatDay(day){
	day = day.replace(/mon( |$)/ig,'monday');
	day = day.replace(/tues( |$)/ig,'tuesday');
	day = day.replace(/wed( |$)/ig,'wednesday');
	day = day.replace(/thurs( |$)/ig,'thursday');
	day = day.replace(/fri( |$)/ig,'friday');

	return day;
}

// Simple day e.g. Wednesday, thurs, fri
function simpleDay(text){
  var re = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|wed|thurs|fri|today|tomorrow)/ig
 
	var result;
	var matches = [];
 
	while((result = re.exec(text)) !== null){

		var formattedDay = formatDay(result[0]);

		var match = {
			match: result[0],
			date: Date.future(formattedDay),
			index: result.index
		};
 
		matches.push(match);
	}
 
	return matches;
}

// Tuesday 10th
function twoPartDate(text){
  var re = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|wed|thurs|fri) [0-9]{1,2}(th|rd|st|nd|)/ig
 
	var result;
	var matches = [];
 
	while((result = re.exec(text)) !== null){

		var datePartMatch = result[0].match("[0-9]{1,2}(th|rd|st|nd)");

		var match = {
			match: result[0],
			date: Date.future(datePartMatch[0]),
			index: result.index
		};

		matches.push(match);
	}

	return matches;
}

// this week and next
function matchThisWeekAndNext(text){
  	var re = /(this week and next)/ig
 
	var result;
	var matches = [];
 
	while((result = re.exec(text)) !== null){

		var thisWeekAndNext = dateTools.getThisWeekDays();

		thisWeekAndNext.push.apply(thisWeekAndNext,dateTools.getNextDays(Date.future("Monday"), 7));

		thisWeekAndNext.each(function(day){
			var match = {
				match: result[0],
				date: day,
				index: result.index
			};
	 
			matches.push(match);
		});
	}
 
	return matches;
}

// Monday, Tuesday and Wednesday of next week
// next Monday, Tuesday and Thursday
function matchDaysOfNextWeeks(text){
  	var re = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|wed|thurs|fri|, | and )+ (of next week|next week)/ig
 
	var result;
	var matches = [];
 
	while((result = re.exec(text)) !== null){

		var reInner = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|wed|thurs|fri)/ig

		while((resultInner = reInner.exec(result[0])) !== null){
			var formattedDay = formatDay(resultInner[0]);

			var match = {
				match: result[0],
				date: dateTools.getNext(formattedDay),
				index: result.index
			};
	 
			matches.push(match);
		}
	}

  	re = /next (monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|wed|thurs|fri|, | and )+/ig
 
	while((result = re.exec(text)) !== null){

		var reInner = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|wed|thurs|fri)/ig

		while((resultInner = reInner.exec(result[0])) !== null){
			var formattedDay = formatDay(resultInner[0]);

			var match = {
				match: result[0],
				date: dateTools.getNext(formattedDay),
				index: result.index
			};
	 
			matches.push(match);
		}
	}

	return matches;
}

// next week
// this week
// week of the 18th
function matchWeeks(text){

  	var re = /(next week)/ig
 
	var result;
	var matches = [];
 
	while((result = re.exec(text)) !== null){

		var days = dateTools.getNextDays(Date.future("Monday"), 7);

		days.each(function(day){
			var match = {
				match: result[0],
				date: day,
				index: result.index
			};
	 
			matches.push(match);
		});
	}

  	re = /(this week)/ig
 
	while((result = re.exec(text)) !== null){

		var days = dateTools.getThisWeekDays();

		days.each(function(day){
			var match = {
				match: result[0],
				date: day,
				index: result.index
			};
	 
			matches.push(match);
		});
	}

  	re = /(week of the|week of) (monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|wed|thurs|fri|)?( |)[0-9]{1,2}(th|rd|st|nd|)/ig
 
	while((result = re.exec(text)) !== null){

		var datePartMatch = result[0].match("[0-9]{1,2}(th|rd|st|nd)");

		if (datePartMatch != null && datePartMatch.length > 0){
			var days = dateTools.getNextDays(Date.future(datePartMatch[0]), 7);

			days.each(function(day){
				var match = {
					match: result[0],
					date: day,
					index: result.index
				};
		 
				matches.push(match);
			});
		}
	}


 
	return matches;
}

// Monday January 10th
function monthDate(text){
  var re = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|wed|thurs|fri|) (january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec) [0-9]{1,2}(th|rd|st|nd|)/ig
 
	var result;
	var matches = [];
 
	while((result = re.exec(text)) !== null){

		var match = {
			match: result[0],
			date: Date.future(result[0]),
			index: result.index
		};

		matches.push(match);
	}

	return matches;
}


function extractDates(text){
	var matches = [];

	// next Monday, Tuesday and Thursday
	// Monday, Tuesday and Wednesday of next week
	matches.push.apply(matches, matchDaysOfNextWeeks(text));
	text = blankMatches(text, matches);

	// this week and next
	matches.push.apply(matches, matchThisWeekAndNext(text));
	text = blankMatches(text, matches);

	// Monday, Tuesday and Wednesday of next week
	// next week
	// this week
	// week of the 18th
	matches.push.apply(matches, matchWeeks(text));
	text = blankMatches(text, matches);

	// Monday January 10th
	matches.push.apply(matches, monthDate(text));
	text = blankMatches(text, matches);

	// Tuesday 10th
	matches.push.apply(matches, twoPartDate(text));
	text = blankMatches(text, matches);

	// 1st, 22nd 
	matches.push.apply(matches, simpleDate(text));
	text = blankMatches(text, matches);

	// Tuesday
	matches.push.apply(matches, simpleDay(text));
	text = blankMatches(text, matches);

	return matches;
}

function getSentiment(text){
	text = text.replace(/'/, '');

	var classification;

	if (text.has('except') || text.has('apart from')){
		classification = 'flip';
	} else {
		classification = classifier.classify(text);		
	}

	return classification;
}

function addSentimentToMatches(text, matches){
	if (matches.length == 0){
		return matches;
	}

	var matchesWithSentiment = [];

	var splitStart = 0;
	var matchIndex = 0;
	var match = matches[matchIndex];

	while (splitStart < text.length || matchIndex < matches.length){
		var sentimentText = text.slice(splitStart, match.index);
		var sentiment = getSentiment(sentimentText);

		if (sentimentText.trim().length > 2){
			matchesWithSentiment.push({match: sentimentText, sentiment: sentiment, index: splitStart});
		}

		matchesWithSentiment.push(match);

		splitStart = match.index + match.match.length;

		matchIndex++;

		if (matchIndex >= matches.length){
			var sentimentText = text.slice(splitStart, text.length);
			var sentiment = getSentiment(sentimentText);

			if (sentimentText.length > 1){
				matchesWithSentiment.push({match: sentimentText, sentiment: sentiment, index: splitStart});	
			}

			break;
		}

		match = matches[matchIndex];
	}

	return matchesWithSentiment;
}

function sentenceParser(text) {
  	return text.split(/(\S.+?[.!?])(?=\s+|$)/).exclude(function(s){
		return s.trim().length == 0;
	});
}

function turnMatchesIntoDates(matches){
	var busyDates = [];
	var freeDates = [];

	var previousSentiment = '';
	var latestSentiment = '';

	var dateToAddToNextSentiment = [];

	matches.each(function(match){
		if (!_.isUndefined(match.date)){
			dateToAddToNextSentiment.push(match.date);
		} else if (!_.isUndefined(match.sentiment)){
			previousSentiment = latestSentiment;
			latestSentiment = match.sentiment;

			if (dateToAddToNextSentiment.length > 0){
				if (previousSentiment != ''){

					if (latestSentiment == 'flip'){
						latestSentiment = (previousSentiment == 'free') ? 'busy' : 'free';
					}

					if (latestSentiment === "free-backwards"){
						addDatesToList(freeDates, busyDates, dateToAddToNextSentiment);
					} else if (latestSentiment === "busy-backwards"){
						addDatesToList(busyDates, freeDates, dateToAddToNextSentiment);
					} else if (previousSentiment.startsWith("free")){
						addDatesToList(freeDates, busyDates, dateToAddToNextSentiment);
					} else if (previousSentiment.startsWith("busy")){
						addDatesToList(busyDates, freeDates, dateToAddToNextSentiment);
					} else {
						// Default add to free
						addDatesToList(freeDates, busyDates, dateToAddToNextSentiment);
					}
	
					dateToAddToNextSentiment = [];
				}
			}
		}
	});

	if (dateToAddToNextSentiment.length > 0){
		if (latestSentiment === "free-backwards"){
			addDatesToList(freeDates, busyDates, dateToAddToNextSentiment);
		} else if (latestSentiment === "busy-backwards"){
			addDatesToList(busyDates, freeDates, dateToAddToNextSentiment);
		} else if (latestSentiment === "free"){
			addDatesToList(freeDates, busyDates, dateToAddToNextSentiment);
		} else if (latestSentiment === "busy"){
			addDatesToList(busyDates, freeDates, dateToAddToNextSentiment);
		} else {
			// Default add to free
			addDatesToList(freeDates, busyDates, dateToAddToNextSentiment);
		}

		dateToAddToNextSentiment = [];
	}

	return [busyDates, freeDates];
}

function addDatesToList(addToList, otherList, dates){
	addToList.push.apply(addToList, dates);

	dates.each(function(date){

		for (var i=0; i < otherList.length; i++){
			if (date.is(otherList[i])){
				otherList.splice(i, 1);
				break;
			}
		}
	});
}

function processBody(body){
	var sentences = sentenceParser(body);

	var busyDates = [];
	var freeDates = [];

	sentences.each(function(sentence){
		var matches = extractDates(sentence);

		matches = addSentimentToMatches(sentence, matches);

		dates = turnMatchesIntoDates(matches);

		busyDates.push.apply(busyDates, dates[0]);
		freeDates.push.apply(freeDates, dates[1]);
	});

	return [busyDates, freeDates];
}

module.exports = {
	processBody: processBody,
	getSentiment: getSentiment,
	extractDates: extractDates,
	blankMatches: blankMatches,
	addSentimentToMatches: addSentimentToMatches

}