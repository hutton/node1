var _ = require("underscore");

var natural = require("natural");
var moment = require("moment");
var sugar = require("sugar");
var logger = require("../tools/logger");

var classifier = new natural.BayesClassifier();

function train(){
	logger.info("Training NLP");

	classifier.addDocument("i can do", 'free');
	classifier.addDocument("i can't do", 'busy');

	classifier.addDocument("would be OK", 'free');


	// classifier.addDocument("i'm free on", 'free2');
	// classifier.addDocument("i can only do", 'free3');
	// classifier.addDocument("would be OK", 'free4');
	// classifier.addDocument("works for me", 'free5');
	// classifier.addDocument("how about", 'free6');
	// classifier.addDocument("looks OK", 'free7');
	// classifier.addDocument("I've got no plans for", 'free8');
	// classifier.addDocument("is best for me", 'free9');
	// classifier.addDocument("Shall we go for", 'free10');
	// classifier.addDocument("suggest", 'free11');
	// classifier.addDocument("might be OK", 'free12');
	// classifier.addDocument("can do", 'free13');
	// classifier.addDocument("is best for me", 'free14');
	// classifier.addDocument("I'm in for", 'free15');
	// classifier.addDocument("anyone?", 'free17');
	// classifier.addDocument("I could do", 'free18');
	// classifier.addDocument("is a possibility", 'free19');
	// classifier.addDocument("anyone?", 'free20');

	// classifier.addDocument("are no good for me", 'busy1');
	// classifier.addDocument("isn't great", 'busy2');
	// classifier.addDocument("i can't do", 'busy3');
	// classifier.addDocument("can't make", 'busy4');
	// classifier.addDocument("wont be able to make", 'busy5');
	// classifier.addDocument("I should be able to make", 'busy6');
	// classifier.addDocument("I can't do", 'busy7');
	// classifier.addDocument("I’m away", 'busy8');
	// classifier.addDocument("can't do", 'busy9');
	// classifier.addDocument("can’t make it", 'busy10');

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

			if (charIndex >= (match.index + match.match.length - 1)){					
				matchIndex++;

				if (matchIndex > matches.length - 1){
					finished = true;
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
  var re = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|wed|thurs|fri)/ig
 
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

function extractDates(text){
	var matches = [];

	matches.push.apply(matches, twoPartDate(text));
	text = blankMatches(text, matches);
	matches.push.apply(matches, simpleDate(text));
	text = blankMatches(text, matches);
	matches.push.apply(matches, simpleDay(text));
	text = blankMatches(text, matches);

	return matches;
}

function getSentiment(text){
	return classifier.classify(text);
}

function addSentimentToMatches(text, matches){
	if (matches.length == 0){
		return matches;
	}

	var matchesWithSentiment = [];

	var splitStart = 0;
	var matchIndex = 0;
	var match = matches[matchIndex];

	while (splitStart < text.length){
		var sentimentText = text.slice(splitStart, match.index);
		var sentiment = getSentiment(sentimentText);

		if (sentimentText.length > 1){
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
    var tmp = text.split(/(\S.+?[.])(?=\s+|$)/g);
    var sentences = [];
    //join acronyms, titles
    for (var i in tmp) {
        if (tmp[i]) {
            tmp[i] = tmp[i].replace(/^\s+|\s+$/g, ''); //trim extra whitespace
            //join common abbreviations + acronyms
            if (tmp[i].match(/(^| )(mr|dr|llb|md|bl|phd|ma|ba|mrs|miss|misses|mister|sir|esq|mstr|jr|sr|st|lit|inc|fl|ex|eg|jan|feb|mar|apr|jun|aug|sept?|oct|nov|dec)\. ?$/i) || tmp[i].match(/[ |\.][a-z]\.?$/i)) {
                tmp[parseInt(i) + 1] = tmp[i] + ' ' + tmp[parseInt(i) + 1];
            }
            else {
                sentences.push(tmp[i]);
                tmp[i] = '';
            }
        }
    }   
    //cleanup afterwards
    var clean = [];
    for (var i in sentences) {
        sentences[i] = sentences[i].replace(/^\s+|\s+$/g, ''); //trim extra whitespace
        if (sentences[i]) {
            clean.push(sentences[i]);
        }
    }
    return clean;
}

function turnMatchesIntoDates(matches){
	var busyDates = [];
	var freeDates = [];

	var currentSentiment = freeDates;

	matches.each(function(match){
		if (!_.isUndefined(match.date)){
			currentSentiment.push(match.date);
		} else if (!_.isUndefined(match.sentiment)){
			if (match.sentiment.startsWith("free")){
				currentSentiment = freeDates;
			} else if (match.sentiment.startsWith("busy")){
				currentSentiment = busyDates;
			}
		}
	});

	return [busyDates, freeDates];
}

function processBody(body){
	var sentences = sentenceParser(body);

	var busyDates = [];
	var freeDates = [];

	sentences.each(function(sentence){
		var matches = extractDates(body);

		matches = addSentimentToMatches(body, matches);

		dates = turnMatchesIntoDates(matches);

		busyDates.push.apply(busyDates, dates[0]);
		freeDates.push.apply(freeDates, dates[1]);
	});

	return [busyDates, freeDates];
}

function processBody2(calendar, body){
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
	processBody: processBody,
	processBody2: processBody2,
	extractDates: extractDates,
	blankMatches: blankMatches,
	addSentimentToMatches: addSentimentToMatches

}