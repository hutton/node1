var _ = require("underscore");
// var sugar = require("sugar");

var input = [{"date":"2013-10-06T00:00:00.000Z","_id":"524da47e9041416f3d000003","free":["524d1cbe8940237b33000005"],"busy":[]},{"date":"2013-10-08T23:00:00.000Z","_id":"524da47e9041416f3d000004","free":["524d1cbe8940237b33000005"],"busy":[]},{"date":"2013-10-16T23:00:00.000Z","_id":"52564efe1e28d04774000003","free":["524d1cbe8940237b33000005"],"busy":[]}];

//var input = [{"date":"2014-02-06T00:00:00.000Z","_id":"524da47e9041416f3d000003","free":["524d1cbe8940237b33000005"],"busy":[]}];

function tomorrow(date){
	var newDate = new Date(date);

	newDate.setDate(newDate.getDate() + 1);

	return newDate;
}

function yesturday(date){
	var newDate = new Date(date);
	
	newDate.setDate(newDate.getDate() - 1);

	return newDate;
}

var processedInput = _.map(input, function(choice){
	return {date: new Date(choice.date), _id: choice._id, free: choice.free};
});

allPopulatedDates = _.map(processedInput, function(choice){ return choice.date.toDateString();});

var earliestDate = new Date();
var latestDate = processedInput[0].date;

for (var i = 1; i < processedInput.length; i++){
	if (processedInput[i].date < earliestDate){
		earliestDate = processedInput[i].date;
	}

	if (processedInput[i].date > latestDate){
		latestDate = processedInput[i].date;
	}
}

var dates = [];

var previousMondayHit = false;

var startOfMonth = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);

var startDate = new Date(startOfMonth);

while (startDate.getDay() !== 1){
	startDate = yesturday(startDate);
}

var current = startDate;

var maxChoices = 365;
var minChoices = 90;
var passedLatest = false;
var passedLatestAndMonthEnd = false;

console.log(allPopulatedDates);
console.log(current.toDateString());

while (maxChoices-- > 0){
	if (allPopulatedDates.indexOf(current.toDateString()) == -1){
		processedInput.push({date: current});
	}

	if (!passedLatest && current > latestDate){
		passedLatest = true;
	}

	current = tomorrow(current);

	if ( !passedLatestAndMonthEnd && passedLatest && processedInput.length > minChoices && current.getDate() === 1){
		passedLatestAndMonthEnd = true;
	}

	if (passedLatestAndMonthEnd && current.getDay() === 1){
		break;
	}
}

processedInput = _.sortBy(processedInput, function(choice){return choice.date;});

console.log(processedInput);

