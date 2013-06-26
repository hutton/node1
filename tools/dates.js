var sugar = require("sugar");

function getNextDays(startDate, count){
	var result = [];

	while(count-- > 0){
		result.push(new Date(startDate));
		startDate.advance("1 day");
	}

	return result;
}

function getThisWeekDays(){
	var result = [];

	var startDate = Date.create("today");

	do {
		result.push(new Date(startDate));
		startDate.advance("1 day");
	} while(startDate.getDay() != 1)

	return result;
}

module.exports = {
	getNextDays: getNextDays,
	getThisWeekDays: getThisWeekDays
}
