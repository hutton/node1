var nlp = require("./nlp");
var moment = require("moment");
var sugar = require("sugar");
var _ = require("underscore");
var dateTools = require("./dates"); 


function compareMatches(expected, result){
	if (expected.length !== result.length){
		return false;
	}
 
	for (var i=0; i < expected.length; i++){
		if (!expected[i].date.is(result[i].date) || expected[i].index !== result[i].index || expected[i].match !== result[i].match ){
			return false;
		}
	}
 
	return true;
}

function compareDates(expected, result){
	if (expected[0].length !== result[0].length || expected[1].length !== result[1].length){
		return false;
	}
 
	for (var i=0; i < expected[0].length; i++){
		if (!expected[0][i].is(result[0][i])){
			return false;
		}

	}

	for (var i=0; i < expected[1].length; i++){
		if (!expected[1][i].is(result[1][i])){
			return false;
		}
	}
 
	return true;
}

function validateExtractText(expected, text){
	var result = nlp.extractDates(text);

	if (compareMatches(expected, result)){
		console.log( "Success extract with: " + text);
	} else {
		console.log( "*********************");
		console.log( "Failed extract! with: " + text);
		console.log( "Expected:");
		prettyPrintResult(expected);
		console.log( "Result:");
		prettyPrintResult(result);
		console.log( "*********************");
	}
}

function prettyPrintResult(result){
	for (var i=0; i < result.length; i++){
		console.log("match: " + result[i].match + " date: " + result[i].date + " index: " + result[i].index);
	}
}

function validate(text, expected){
	var result = nlp.processBody(text);

	if (compareDates(expected, result)){
		console.log( "Success with: " + text);
	} else {
		console.log( "*********************");
		console.log( "Failed! with: " + text);
		console.log( "Expected:");
		console.log(expected);
		console.log( "Result:");
		console.log(result);
		console.log( "*********************");
	}
}

// console.log(nlp.getSentiment("_______ isnt great"));

// console.log(nlp.addSentimentToMatches("i can do 3rd i can't do 19th ", [
// 	{ match: "3rd", date: Date.future("3rd"), index: 9 },
// 	{ match: "19th", date: Date.future("19th"), index: 25 },
// 	]));


var thisWeekAndNext = dateTools.getThisWeekDays();
thisWeekAndNext.push.apply(thisWeekAndNext,dateTools.getNextDays(Date.future("Monday"), 7));

validate("21st match", [[],[Date.future("21st")]]);
validate("i can do the 21st i can't do the 1st", [[Date.future("1st")],[Date.future("21st")]]);
validate("25th would be OK", [[],[Date.future("25th")]]);
validate("25th works for me", [[],[Date.future("25th")]]);
validate("how about Thurs 25th", [[],[Date.future("25th")]]);
validate("Thurs 21st looks OK", [[],[Date.future("21st")]]);
validate("next week isn't great", [dateTools.getNextDays(Date.future("Monday"), 7),[]]);
validate("i can do any day next week", [[],dateTools.getNextDays(Date.future("Monday"), 7)]);
validate("i can do any day this week", [[],dateTools.getThisWeekDays()]);
validate("i can't do any day next week", [dateTools.getNextDays(Date.future("Monday"), 7),[]]);
validate("i can't do any day this week", [dateTools.getThisWeekDays(),[]]);
validate("well this week is bad for me", [dateTools.getThisWeekDays(),[]]);
validate("I can't do Wednesday", [[Date.future("Wednesday")],[]]);
validate("I can do next week", [[],dateTools.getNextDays(Date.future("Monday"), 7)]);
validate("I can do next week. I can't do Wednesday", [[Date.future("Wednesday")],dateTools.getNextDays(Date.future("Monday"), 7)]);
validate("Me can't do Wednesday. Me busy on Thursday", [[Date.future("Wednesday"), Date.future("Thursday")],[]]);
validate("I can't on tuesday or wednesday. I can do thursday", [[Date.future("Tuesday"), Date.future("Wednesday")],[Date.future("Thursday")]]);
validate("I’m away this week", [dateTools.getThisWeekDays(),[]]);
validate("Thursday is best for me", [[],[Date.future("Thursday")]]);
validate("Wednesday works for me.", [[],[Date.future("Wednesday")]]);
validate("Shall we go for Wednesday", [[],[Date.future("Wednesday")]]);
validate("suggest Wednesday 19th?", [[],[Date.future("19th")]]);
validate("How about 12th / 13th, 19th / 20th Dec? ", [[],[Date.future("12th"),Date.future("13th"),Date.future("19th"),Date.future("20th")]]);
validate("might be OK for 1st", [[],[Date.future("1st")]]);
validate("Can't do 31st", [[Date.future("31st")],[]]);
validate("can't make tomorrow", [[Date.create("tomorrow")],[]]);
validate("can't make today", [[Date.create("today")],[]]);
validate("31st or 1st Nov.", [[],[Date.future("31st"), Date.future("1st")]]);
validate("wont be able to make the 31st", [[Date.future("31st")],[]]);
validate("Wednesday Oct 31st is best for me", [[],[Date.future("Oct 31st")]]);
validate("I'm in for Wednesday 29th", [[],[Date.future("29th")]]);
validate("I should be able to make the 29th", [[],[Date.future("29th")]]);
validate("can't make it on the 31st", [[Date.future("31st")],[]]);
validate("I can't do 30th", [[Date.future("30th")],[]]);
validate("Friday 3rd anyone?", [[],[Date.future("3rd")]]);
validate("the 3rd is a possibility.", [[],[Date.future("3rd")]]);
validate("I‘m away this week and next", [thisWeekAndNext,[]]);

// // Simple dates e.g. 1st, 22nd 
// validateExtractText([
// 	{ match: "21st", date: Date.future("21st"), index: 0 },
// 	], "21st match");
// validateExtractText([
// 	{ match: "1st", date: Date.future("1st"), index: 0 },
// 	{ match: "18th", date: Date.future("18th"), index: 10 },
// 	{ match: "22nd", date: Date.future("22nd"), index: 28 },
// 	], "1st match 18th not 47 dates 22nd");
// validateExtractText([
// 	{ match: "3rd", date: Date.future("3rd"), index: 0 },
// 	{ match: "19th", date: Date.future("19th"), index: 25 },
// 	], "3rd match 18ee not dates 19th end");

// // Simple day e.g. Wednesday, thurs, fri
// validateExtractText([
// 	{ match: "Friday", date: Date.future("Friday"), index: 5 },
// 	], "next Friday is good");
// validateExtractText([
// 	{ match: "thurs", date: Date.future("Thursday"), index: 0 },
// 	], "thurs is good");
// validateExtractText([
// 	{ match: "thurs", date: Date.future("Thursday"), index: 0 },
// 	{ match: "Wednesday", date: Date.future("Wednesday"), index: 9 },
// 	{ match: "Saturday", date: Date.future("Saturday"), index: 22 },
// 	{ match: "sunday", date: Date.future("Sunday"), index: 40 },
// 	], "thurs is Wednesday or Saturday good not sunday");

// // Two part dates e.g. Friday 21st
// validateExtractText([
// 	{ match: "Friday 21st", date: Date.future("21st"), index: 0 },
// 	], "Friday 21st is good");
// validateExtractText([
// 	{ match: "Friday 21st", date: Date.future("21st"), index: 0 },
// 	{ match: "Mon 1st", date: Date.future("1st"), index: 33 },
// 	{ match: "22nd", date: Date.future("22nd"), index: 20 },
// 	], "Friday 21st and the 22nd but not Mon 1st");
// validateExtractText([
// 	{ match: "Friday 21st", date: Date.future("21st"), index: 0 },
// 	{ match: "Saturday 2nd", date: Date.future("2nd"), index: 12 },
// 	{ match: "Wed 3rd", date: Date.future("3rd"), index: 25 },
// 	{ match: "Thursday", date: Date.future("Thursday"), index: 38 },
// 	], "Friday 21st Saturday 2nd,Wed 3rd then Thursday");

// Match weeks i.e. next week
// var dates = dateTools.getNextDays(Date.future("Monday"), 7);

// var thisWeek = dateTools.getThisWeekDays();

// validateExtractText([
// 	{ match: "next week", date: dates[0], index: 17 },
// 	{ match: "next week", date: dates[1], index: 17 },
// 	{ match: "next week", date: dates[2], index: 17 },
// 	{ match: "next week", date: dates[3], index: 17 },
// 	{ match: "next week", date: dates[4], index: 17 },
// 	{ match: "next week", date: dates[5], index: 17 },
// 	{ match: "next week", date: dates[6], index: 17 },
// 	], "i can do any day next week if that's ok");

// var matchDays = [];

// thisWeek.each(function(day){
// 	matchDays.push({match: "this week", date: day, index: 17});
// });

// validateExtractText(matchDays, "i can do any day this week if that's ok");


