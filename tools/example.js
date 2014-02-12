
var moment = require("moment");

function getExample(){
	return {
		"calendarId" : "example",
		"id" : "office-drinks",
		"name" : "Office drinks",
		"date" : new Date(moment()),
		"attendees" : [
			{
				"_id" : "A01",
				"attendeeId" : "exampleA01",
				"email" : "hbanks@warmmail.co",
				"name" : "Hugo Banks"
			},
			{
				"_id" : "A02",
				"attendeeId" : "exampleA02",
				"email" : "harriet.daniels@googles.con",
				"name" : "Harriet Daniels"
			},
			{
				"_id" : "A03",
				"attendeeId" : "exampleA03",
				"email" : "stewarthart@now.net",
				"name" : "Stewart Hart"
			},
			{
				"_id" : "A04",
				"attendeeId" : "exampleA04",
				"email" : "jhenderson@timemail.in",
				"name" : "Julia Henderson"
			},
			{
				"_id" : "A05",
				"attendeeId" : "exampleA05",
				"email" : "sheldon.hamilton@lookin.co",
				"name" : "Sheldon Hamilton"
			},
			{
				"_id" : "A06",
				"attendeeId" : "exampleA06",
				"email" : "naomi_morgan@newstime.ip",
				"name" : "Naomi Morgan"
			},
			{
				"_id" : "A07",
				"attendeeId" : "exampleA07",
				"email" : "mullinst@thingy.nets",
				"name" : "Traci Mullins"
			}
		],
		"createdBy" : "1@gmail.com",
		"choices" : [
			{
				"date" : new Date(moment().add('days', 0)),
				"free" : [
					"A02",
					"A03"
					],
				"busy" : []
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 1)),
				"free" : [
					"A02",
					"A04",
					"A05",
					"A06"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 3)),
				"free" : [
					"A02",
					"A03",
					"A04",
					"A05",
					"A06",
					"A07"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 5)),
				"free" : [
					"A01",
					"A02"
				]
			},
			{
				"_id" : "c006",
				"busy" : [],
				"date" : new Date(moment().add('days', 6)),
				"free" : [
					"A06"
				]
			},
			{
				"_id" : "c007",
				"busy" : [],
				"date" : new Date(moment().add('days', 7)),
				"free" : [
					"A04",
					"A05",
					"A06",
					"A07"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 8)),
				"free" : [
					"A01",
					"A02",
					"A03",
					"A04",
					"A05",
					"A06",
					"A07"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 9)),
				"free" : [
					"A06",
					"A07"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 10)),
				"free" : [
					"A01",
					"A02"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 14)),
				"free" : [
					"A01",
					"A02",
					"A03",
					"A04",
					"A05",
					"A05",
					"A07"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 17)),
				"free" : [
					"A01",
					"A02",
					"A05",
					"A06"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 21)),
				"free" : [
					"A01",
					"A02",
					"A03",
					"A04",
					"A05",
					"A06",
					"A07"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 23)),
				"free" : [
					"A02",
					"A05",
					"A06"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 26)),
				"free" : [
					"A05"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 28)),
				"free" : [
					"A01",
					"A05",
					"A07"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 30)),
				"free" : [
					"A03"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 32)),
				"free" : [
					"A04",
					"A02",
					"A03"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 34)),
				"free" : [
					"A07"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 37)),
				"free" : [
					"A01",
					"A06"
				]
			}
		]
	};
}

exports.getExample = function(){
	return getExample();
};


