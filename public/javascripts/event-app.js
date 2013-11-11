
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

	footerEl: $(".footer"),

	footerDateEl: $(".footer-date"),

	footerTextEl: $(".footer-text"),

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
	},

	updateSelectedText: function(choiceModel){
		var that = this;
		var mom = moment(choiceModel.get("date"));

		var today = new Date();
    	today.setHours(0, 0, 0, 0);
		var diff = moment(today).diff(mom, 'days');

		$(".navbar-fixed-bottom").show();

		var dateTex = "";

		if (diff == 0){
			dateText = "Today";
		} else if (diff == -1){
			dateText = "Tomorrow";
		} else if (diff == 1){
			dateText = "Yesterday";
		} else {
			dateText = mom.format("dddd D MMMM");
		}

		var footerText = "";
		var currentAttendeeId = window.App.currentAttendee.get("_id");
		var freeAttendees = choiceModel.get("free");

		if (_.isUndefined(freeAttendees) || freeAttendees.indexOf(currentAttendeeId) == -1){
			// You're not free
			if (_.isUndefined(freeAttendees) || freeAttendees.length === 0){
				footerText = "<strong>Nobody</strong> has marked this as free yet.";
			} else if (freeAttendees.length - 1 == App.attendees.length) {
				footerText = "<strong>Everyone</string> except you is free.";
			} else {
				footerText = this.buildAttendeeNameText(freeAttendees);
			}
		} else {
			// You're free
			if (freeAttendees.length == App.attendees.length){
				footerText = "<strong>Everyone</strong> can make it.";
			} else {
				footerText = this.buildAttendeeNameText(freeAttendees);
			}
		}

		this.footerEl.fadeOut(100, function(){
			that.footerDateEl.html(dateText);

			that.footerTextEl.html(footerText);

			that.footerEl.fadeIn(100);
		});
	},

	buildAttendeeNameText: function(freeAttendees){
		var prettyNames = [];
		var meFound = false;
		var that = this;

		_.each(freeAttendees, function(attendeeId){
			var attendee = that.attendees.findWhere({_id: attendeeId});

			if (!_.isUndefined(attendee)){
				if (attendee.get('me')){
					meFound = true;
				} else {
					prettyNames.push("<strong>" + attendee.get('prettyName') + "</strong>");
				}
			}
		});

		var text = "";

		if (meFound && prettyNames.length === 0){
			text = "Only <strong>you</strong> are free so far.";
		} else if (!meFound && prettyNames.length === 1){
			text = "Only " + prettyNames[0] + " is free so far.";
		} else if (meFound){
			text = prettyNames.join(", ");
			text.slice(0, -2);
			text = text + " and <strong>you</strong> are free.";
		} else {
			for (var i=0; i < prettyNames.length; i++){
				text = text + prettyNames[i];

				if (i < prettyNames.length - 2 ){
					text = text + ", ";
				} else if (i === prettyNames.length - 2){
					text = text + " and ";
				}
			}

			text = text + " are free.";
		}

		return text;
	}
});
