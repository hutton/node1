_.templateSettings = {
  interpolate: /\<\@\=(.+?)\@\>/gim,
  evaluate: /\<\@(.+?)\@\>/gim,
  escape: /\<\@\-(.+?)\@\>/gim
};

var isTouchDevice = 'ontouchstart' in window || !!(navigator.msMaxTouchPoints);

Array.prototype.removeElement = function(element) {
	var index = this.indexOf(element);
 
	while (index !== -1){
		this.splice(index, 1);
		index = this.indexOf(element);
	}
};

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

function sameDay(date1, date2){
	if (date1.getDate() == date2.getDate() &&
		date1.getMonth() == date2.getMonth() &&
		date1.getFullYear() == date2.getFullYear()){
		return true;
	}

	return false;
}

function expandDates(input){
	var processedInput = _.map(input, function(choice){
		return {date: new Date(choice.date), _id: choice._id, free: choice.free};
	});

	allPopulatedDates = _.map(processedInput, function(choice){ return choice.date.toISOString();});


	var earliestDate = new Date();
	var latestDate = new Date();

	if (input.length > 0){
		earliestDate = processedInput[0].date;
		latestDate = processedInput[0].date;
	}

	for (var i = 1; i < processedInput.length; i++){
		if (processedInput[i].date < earliestDate){
			earliestDate = processedInput[i].date;
		}

		if (processedInput[i].date > latestDate){
			latestDate = processedInput[i].date;
		}
	}

	var dates = [];

	var early = new Date(earliestDate);
	var latest = new Date(latestDate);

	var previousMondayHit = false;

	var startOfMonth = new Date(early.getFullYear(), early.getMonth(), 1);

	var startDate = new Date(startOfMonth);

	while (startDate.getDay() !== 1){
		startDate = yesturday(startDate);
	}

	var current = startDate;

	current.setHours(0,0,0,0);

	var maxChoices = 365;
	var minChoices = 90;
	var passedLatest = false;
	var passedLatestAndMonthEnd = false;

	while (maxChoices-- > 0){
		if (allPopulatedDates.indexOf(current.toISOString()) == -1){
			processedInput.push({date: current});
		}

		if (!passedLatest && current > latest){
			passedLatest = true;
		}

		current = tomorrow(current);

		current.setHours(0,0,0,0);

		if ( !passedLatestAndMonthEnd && passedLatest && processedInput.length > minChoices && current.getDate() === 1){
			passedLatestAndMonthEnd = true;
		}

		if (passedLatestAndMonthEnd && current.getDay() === 1){
			break;
		}
	}

	processedInput = _.sortBy(processedInput, function(choice){return choice.date;});

	return processedInput;
}

