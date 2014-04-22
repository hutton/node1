var moment = require("moment");

function toUTCDate(date){
	return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function tomorrow(date){
	var newDate = new Date(date);

	newDate.setDate(newDate.getDate() + 1);

	return newDate;
}

function getFrees(index){
	var frees = [[
					"A02",
					"A03",
					"A04",
					"A05",
					"A06"
				],[
					"A02",
					"A03"
					],[
					"A02",
					"A04",
					"A05",
					"A06"
				],[
					"A02",
					"A03",
					"A04",
					"A05",
					"A06"
				],[
					"A01",
					"A02"
				],[
					"A06"
				],[
					"A04",
					"A05",
					"A06"
				],[
					"A01",
					"A02",
					"A03",
					"A04",
					"A05",
					"A06"
				],[
					"A06"
				],[
					"A01",
					"A02"
				],
				[],
				[],
				[],
				[],
				[
					"A01",
					"A02",
					"A03",
					"A04",
					"A05"
				],
				[],
				[],
				[
					"A01",
					"A02",
					"A05",
					"A06"
				],[
					"A01",
					"A02",
					"A03",
					"A04",
					"A05",
					"A06"
				],[
					"A02",
					"A05",
					"A06"
				],[
					"A05"
				],[
					"A01",
					"A05"
				],[
					"A03"
				],[
					"A04",
					"A02",
					"A03"
				],[
					"A04"
				],[
					"A01",
					"A06"
				],[
					"A02",
					"A04",
					"A05"
				],[
					"A05"
				],[
					"A01",
					"A05",
					"A02"
				],[
					"A03"
				],[
					"A04",
					"A02",
					"A03"
				]];


	if (index < frees.length){
		return frees[index];
	} else {
		return [];
	}
}

function getExample(){

	var choices = [];

	var daysAdded = 0;

	var date = toUTCDate(new Date());

	var minDays = 30;

	while (!(daysAdded > minDays && date.getDay() !== 0)){
		if (date.getDay() !== 0 && date.getDay() !== 6){

			choices.push({
				"busy" : [],
				"date" : date,
				"selectable": true,
				"free" : getFrees(daysAdded)
			});

			daysAdded++;
		}

		date = tomorrow(date);
	}

	var model = {
		"calendarId" : "example",
		"id" : "lets-go-bowling",
		"name" : "Let's go bowling!",
		"datesSelected": true,
		"everythingSelectable": false,
		"date" : new Date(moment()),
		"attendees" : [
			{
				"_id" : "A02",
				"attendeeId" : "exampleA02",
				"email" : "harriet.daniels@googles.con",
				"name" : "Harriet"
			},
			{
				"_id" : "A03",
				"attendeeId" : "exampleA03",
				"email" : "stewarthart@now.net",
				"name" : "Stewart"
			},
			{
				"_id" : "A04",
				"attendeeId" : "exampleA04",
				"email" : "jhenderson@timemail.in",
				"name" : "Julia"
			},
			{
				"_id" : "A01",
				"attendeeId" : "exampleA01",
				"email" : "hbanks@warmmail.co",
				"name" : "Hugo"
			},
			{
				"_id" : "A05",
				"attendeeId" : "exampleA05",
				"email" : "sheldon.hamilton@lookin.co",
				"name" : "Sheldon"
			},
			{
				"_id" : "A06",
				"attendeeId" : "exampleA06",
				"email" : "naomi_morgan@newstime.ip",
				"name" : "Naomi"
			}
		],
		"createdBy" : "1@gmail.com",
		"choices" : []
	};

	model.choices = choices;

	return model;
}

exports.getExample = function(){
	return getExample();
};


