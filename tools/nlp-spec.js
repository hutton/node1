var nlp = require("./nlp");
var moment = require("moment");
var sugar = require("sugar");
var _ = require("underscore");


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

function validate(expected, text){
	var result = nlp.extractDates(text);

	if (compareMatches(expected, result)){
		console.log( "Success with: " + text);
	} else {
		console.log( "*********************");
		console.log( "Failed! with: " + text);
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

console.log(nlp.processBody("i can't do 3rd I can do 19th"));


// return nlp.addSentimentToMatches("3rd match 18ee not dates 19th end", [
// 	{ match: "3rd", date: Date.future("3rd"), index: 0 },
// 	{ match: "19th", date: Date.future("19th"), index: 25 },
// 	]);

// Simple dates e.g. 1st, 22nd 
// validate([
// 	{ match: "21st", date: Date.future("21st"), index: 0 },
// 	], "21st match");
// validate([
// 	{ match: "1st", date: Date.future("1st"), index: 0 },
// 	{ match: "18th", date: Date.future("18th"), index: 10 },
// 	{ match: "22nd", date: Date.future("22nd"), index: 28 },
// 	], "1st match 18th not 47 dates 22nd");
// validate([
// 	{ match: "3rd", date: Date.future("3rd"), index: 0 },
// 	{ match: "19th", date: Date.future("19th"), index: 25 },
// 	], "3rd match 18ee not dates 19th end");

// // Simple day e.g. Wednesday, thurs, fri
// validate([
// 	{ match: "Friday", date: Date.future("Friday"), index: 5 },
// 	], "next Friday is good");
// validate([
// 	{ match: "thurs", date: Date.future("Thursday"), index: 0 },
// 	], "thurs is good");
// validate([
// 	{ match: "thurs", date: Date.future("Thursday"), index: 0 },
// 	{ match: "Wednesday", date: Date.future("Wednesday"), index: 9 },
// 	{ match: "Saturday", date: Date.future("Saturday"), index: 22 },
// 	{ match: "sunday", date: Date.future("Sunday"), index: 40 },
// 	], "thurs is Wednesday or Saturday good not sunday");

// // Two part dates e.g. Friday 21st
// validate([
// 	{ match: "Friday 21st", date: Date.future("21st"), index: 0 },
// 	], "Friday 21st is good");
// validate([
// 	{ match: "Friday 21st", date: Date.future("21st"), index: 0 },
// 	{ match: "Mon 1st", date: Date.future("1st"), index: 33 },
// 	{ match: "22nd", date: Date.future("22nd"), index: 20 },
// 	], "Friday 21st and the 22nd but not Mon 1st");
// validate([
// 	{ match: "Friday 21st", date: Date.future("21st"), index: 0 },
// 	{ match: "Saturday 2nd", date: Date.future("2nd"), index: 12 },
// 	{ match: "Wed 3rd", date: Date.future("3rd"), index: 25 },
// 	{ match: "Thursday", date: Date.future("Thursday"), index: 38 },
// 	], "Friday 21st Saturday 2nd,Wed 3rd then Thursday");

