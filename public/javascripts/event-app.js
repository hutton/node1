
window.EventApp = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.ChoicesView = new ChoicesView({collection: bootstrapedChoices, attendees: bootstrappedAttendees});

		this.ChoicesView.render();
	},

	el: $("body"),

	events: {
		"click #show-info":				"infoClicked"
	},

	initialise: function(){
		_.bindAll(this);
	},

	infoClicked: function(){
		this.$el.find(".info").slideToggle("fast");
	}
});

$(document).ready(function(){
	FastClick.attach(document.body);

	window.App = new EventApp();

	window.App.initialise();
});
