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

function toUTCDate(date){
	return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function expandDates(input, everythingSelectable){
	var processedInput = _.map(input, function(choice){
		return {date: toUTCDate(new Date(choice.date)), _id: choice._id, free: choice.free, selectable: choice.selectable, selected: false};
	});

	allPopulatedDates = _.map(processedInput, function(choice){ return choice.date.toDateString();});

	var earliestDate = new Date();
	var latestDate = new Date();

	if (input.length > 0){
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

	var early = toUTCDate(new Date(earliestDate));
	var latest = toUTCDate(new Date(latestDate));

	latest.setDate(latest.getDate() + 7);

	var startOfMonth = toUTCDate(new Date(early.getFullYear(), early.getMonth(), 1));

	var startDate = toUTCDate(new Date(startOfMonth));

	while (startDate.getDay() !== 1){
		startDate = yesturday(startDate);
	}

	var current = startDate;

	var maxChoices = 750;
	var minChoices = 182;
	var passedLatest = false;
	var passedLatestAndMonthEnd = false;

	while (maxChoices-- > 0){
		if (allPopulatedDates.indexOf(current.toDateString()) == -1){
			processedInput.push({date: current, selectable: everythingSelectable, selected: false});
		}

		// Make sure we've got pasted the latest day
		if (!passedLatest && current > latest){
			passedLatest = true;
		}

		current = tomorrow(current);

		// Make sure we've finished off the current month
		if ( !passedLatestAndMonthEnd && passedLatest && processedInput.length > minChoices && current.getDate() === 1){
			passedLatestAndMonthEnd = true;
		}

		// Make sure we finish on a Sunday
		if (passedLatestAndMonthEnd && current.getDay() === 1){
			break;
		}
	}

	processedInput = _.sortBy(processedInput, function(choice){return choice.date;});

	var today = toUTCDate(new Date());

	_.each(processedInput, function(choice){
		choice.past = choice.date < today;
		//choice.selectable = choice.selectable && !choice.past;
	});


	return processedInput;
}

