
window.EventApp = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},

	loadBootstrapData: function(bootstrapedChoices, bootstrappedAttendees, bootstrappedCalendar){
		this.choices = new ChoicesModel;

		this.choices.reset(expandDates(bootstrapedChoices));

		this.attendees = new Backbone.Collection;

		this.attendees.reset(bootstrappedAttendees);

		this.model = new CalendarModel(bootstrappedCalendar);

		this.currentAttendee = this.attendees.findWhere({me: true});

		this.ChoicesView = new ChoicesView({collection: this.choices, attendees: this.attendees});

		this.ChoicesView.render();

		this.render();
	},

	el: $("body"),

	events: {
		"click #show-info":				"infoClicked"
	},

	infoClicked: function(){
		this.$el.find(".info").slideToggle("fast");
	},

	render: function(){
		this.$el.find(".title").html(this.model.get("name"));

		var names = this.attendees.pluck("prettyName");
		var nameList = "";
		_.each(names, function(name){
			nameList = nameList + name + ", ";
		});

		nameList = nameList.slice(0, -2);

		this.$el.find(".attendees").html(nameList);

		this.$el.find("#email-group").attr("href", "mailto:" + this.model.get("id") + "@convenely.com");
	}
});
