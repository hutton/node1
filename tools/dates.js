var sugar = require("sugar");

function getNextDays(startDate, count){
	var result = [startDate];

	while(count-- > 0){
		result.push(new Date(startDate));
		startDate.advance("1 day");
	}

	return result;
}

module.exports = {
	getNextDays: getNextDays
}
