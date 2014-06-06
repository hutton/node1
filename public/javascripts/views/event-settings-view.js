window.EventSettingsView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.attendees = this.options.attendees;

		this.descriptionInputEl = this.$el.find("#settings-description");
		this.descriptionSaveButtonEl = this.$el.find("#settings-description-save");
		this.descriptionCancelButtonEl = this.$el.find("#settings-description-cancel");

		this.venueInputEl = this.$el.find("#settings-venue");
		this.venueSaveButtonEl = this.$el.find("#settings-venue-save");
		this.venueCancelButtonEl = this.$el.find("#settings-venue-cancel");

		this.betweenTextEl = this.$el.find("#event-settings-between-text");

		this.attendeeListEl = this.$el.find("#settings-attendee-list");

		this.listenTo(this.collection, "change", this.choicesChanged);

		this.render();
	},

	el: $(".event-settings-container"),

	events: {
		"input #settings-description": "descriptionChanged",
		"click #settings-description-save": "descriptionSave",
		"click #settings-description-cancel": "descriptionCancel",
		"input #settings-venue": "venueChanged",
		"click #settings-venue-save": "venueSave",
		"click #settings-venue-cancel": "venueCancel",
		"click #settings-between-change": "changeBetween"
	},

	render: function(){
		var that = this;

		this.descriptionInputEl.elastic();

		this.descriptionInputEl.val(this.model.get('description'));

		this.venueInputEl.elastic();

		this.venueInputEl.val(this.model.get('venue'));

		_.each(this.attendees.models, function(model){
			var attendee = new EventSettingsAttendeeView({model: model});

			that.attendeeListEl.append(attendee.$el);
		});
	},

	choicesChanged: function(){
		var selectable = this.collection.firstAndLastDates();

		if (selectable.first !== null && selectable.last !== null){
			var text = moment(selectable.first).format("dddd Do MMMM") + " and " + moment(selectable.last).format("dddd Do MMMM");

			this.betweenTextEl.html(text);
		}
	},

	show: function(){
		this.$el.show();

		this.$el.removeClass('event-settings-container-hidden');
	},

	hide: function(){
		var that = this;

		this.$el.addClass('event-settings-container-hidden');

		_.delay(function(){
			that.$el.hide();
		}, 400);
	},

	descriptionChanged: function(){
		if (this.descriptionInputEl.val() === this.model.get('description')){
			this.descriptionSaveButtonEl.addClass("settings-button-hidden");
			this.descriptionCancelButtonEl.addClass("settings-button-hidden");
		} else {
			this.descriptionSaveButtonEl.removeClass("settings-button-hidden");
			this.descriptionCancelButtonEl.removeClass("settings-button-hidden");
		}
	},

	descriptionSave: function(){
		this.model.set({description: this.descriptionInputEl.val()});

		this.model.save();

		this.descriptionChanged();
	},

	descriptionCancel: function(){
		this.descriptionInputEl.val(this.model.get('description'));

		this.descriptionChanged();	
	},

	venueChanged: function(){
		if (this.venueInputEl.val() === this.model.get('venue')){
			this.venueSaveButtonEl.addClass("settings-button-hidden");
			this.venueCancelButtonEl.addClass("settings-button-hidden");
		} else {
			this.venueSaveButtonEl.removeClass("settings-button-hidden");
			this.venueCancelButtonEl.removeClass("settings-button-hidden");
		}
	},

	venueSave: function(){
		this.model.set({venue: this.venueInputEl.val()});

		this.model.save();

		this.venueChanged();
	},

	venueCancel: function(){
		this.venueInputEl.val(this.model.get('venue'));

		this.venueChanged();	
	},

	changeBetween: function(){
		App.showCalendar();

		App.changeSelectableDates();
	}
});
