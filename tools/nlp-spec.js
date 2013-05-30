var nlp = require("nlp");
var moment = require("moment");
var sugar = require("sugar");

var context = {today: new Date("April 9, 2013")};

nlp.extractDates("25th would be OK", context);