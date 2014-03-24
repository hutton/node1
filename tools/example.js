
var moment = require("moment");

function getExample(){
	return {
		"calendarId" : "example",
		"id" : "office-drinks",
		"name" : "Office drinks",
		"datesSelected": true,
		"everythingSelectable": false,
		"date" : new Date(moment()),
		"attendees" : [
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
				"_id" : "A01",
				"attendeeId" : "exampleA01",
				"email" : "hbanks@warmmail.co",
				"name" : "Hugo Banks"
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
				"selectable": true,
				"free" : [
					"A02",
					"A03"
					],
				"busy" : []
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 1)),
				"selectable": true,
				"free" : [
					"A02",
					"A04",
					"A05",
					"A06"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 2)),
				"selectable": true,
				"free" : []
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 3)),
				"selectable": true,
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
				"date" : new Date(moment().add('days', 4)),
				"selectable": true,
				"free" : []
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 5)),
				"selectable": true,
				"free" : [
					"A01",
					"A02"
				]
			},
			{
				"_id" : "c006",
				"busy" : [],
				"date" : new Date(moment().add('days', 6)),
				"selectable": true,
				"free" : [
					"A06"
				]
			},
			{
				"_id" : "c007",
				"busy" : [],
				"date" : new Date(moment().add('days', 7)),
				"selectable": true,
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
				"selectable": true,
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
				"selectable": true,
				"free" : [
					"A06",
					"A07"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 10)),
				"selectable": true,
				"free" : [
					"A01",
					"A02"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 11)),
				"selectable": true,
				"free" : []
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 12)),
				"selectable": true,
				"free" : []
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 13)),
				"selectable": true,
				"free" : []
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 14)),
				"selectable": true,
				"free" : [
					"A01",
					"A02",
					"A03",
					"A04",
					"A05",
					"A07"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 15)),
				"selectable": true,
				"free" : []
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 16)),
				"selectable": true,
				"free" : []
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 17)),
				"selectable": true,
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
				"selectable": true,
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
				"selectable": true,
				"free" : [
					"A02",
					"A05",
					"A06"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 26)),
				"selectable": true,
				"free" : [
					"A05"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 28)),
				"selectable": true,
				"free" : [
					"A01",
					"A05",
					"A07"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 30)),
				"selectable": true,
				"free" : [
					"A03"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 32)),
				"selectable": true,
				"free" : [
					"A04",
					"A02",
					"A03"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 34)),
				"selectable": true,
				"free" : [
					"A07"
				]
			},
			{
				"busy" : [],
				"date" : new Date(moment().add('days', 37)),
				"selectable": true,
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


