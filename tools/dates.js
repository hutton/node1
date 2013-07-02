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

function getNext(day){
	var d = Date.future("Monday");

	day = day.toLowerCase();

	switch (day){
		case "monday":
			break;
		case "tuesday":
			d.advance("1 day");
			break;
		case "wednesday":
			d.advance("2 day");
			break;
		case "thursday":
			d.advance("3 day");
			break;
		case "friday":
			d.advance("4 day");
			break;
		case "saturday":
			d.advance("5 day");
			break;
		case "sunday":
			d.advance("6 day");
			break;
		default:
			console.log("No day " + day);
	}

	return d;
}

module.exports = {
	getNextDays: getNextDays,
	getThisWeekDays: getThisWeekDays,
	getNext: getNext
}
