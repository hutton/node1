var mongoose = require("mongoose");

var AttendeeSchema = new mongoose.Schema({
	name: {
		type: String,
		index: true
	},
	email: {
		type: String,
		index: true
	}
});

var Attendee = mongoose.model('Attendee', AttendeeSchema);

module.exports = {
	Attendee: Attendee,
	AttendeeSchema: AttendeeSchema
}