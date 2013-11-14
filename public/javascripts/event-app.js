
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
		"click #show-info":				"infoClicked",
		"click .title":  				"infoClicked",
		"click .event-table":			"eventTableClicked",
		"click":						"eventTableClicked",
		"click #add-attendee": 			"addAttendeeClicked", 
		"click #add-attendee-link": 	"addAttendeeLinkClicked",
		"click #add-attendee-cancel-link": "addAttendeeCancelClicked"
	},

	selectedRowTemplate: _.template($('#selected-row-template').html()),

	infoClicked: function(){
		this.$el.find(".info").slideToggle("fast");

		this.$el.find("#show-info > span").toggleClass("show-info-rotate");
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

	eventTableClicked: function(event){
		if ($(event.target).parents("td.date-cell").length === 0){
			this.removeSelectedRow();
			$(".selected").removeClass('selected');
		}
	},

	updateSelectedItem: function(choiceModel, selectedRow){
		var dateText = this.buildDateText(choiceModel);
		var attendeeText = this.buildAttendeeText(choiceModel);

		if (!selectedRow.next().hasClass("selected-row")){
			this.removeSelectedRow();

			this.showSelectedRowAfter(selectedRow, {dateText: dateText, attendeeText: attendeeText});
		} else {
			var footerDateEl = $(".info-row-date");
			var footerTextEl = $(".info-row-text");

			footerDateEl.fadeOut(100, function(){
				footerDateEl.html(dateText);
				footerDateEl.fadeIn(100);
			});

			footerTextEl.fadeOut(100, function(){
				footerTextEl.html(attendeeText);
				footerTextEl.fadeIn(100);
			});
		}
	},

	showSelectedRowAfter: function(selectedRow, templateValues){
		selectedRow.after(this.selectedRowTemplate(templateValues));

		selectedRow.next()
			.find('td')
			.wrapInner('<div style="display: none;" />')
			.parent()
			.find('td > div')
			.slideDown(200, function(){

			var $set = $(this);
			$set.replaceWith($set.contents());

			});
	},

	removeSelectedRow: function(){
		var allSelectedRows = $('.selected-row');

		allSelectedRows
			.find('td')
			.wrapInner('<div style="display: block;" />')
			.parent()
			.find('td > div')
			.slideUp(200, function(){
			allSelectedRows.remove();
			});
	},

	buildAttendeeText: function(choiceModel){
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
				footerText = this.defaultAttendeeText(freeAttendees);
			}
		} else {
			// You're free
			if (freeAttendees.length == App.attendees.length){
				footerText = "<strong>Everyone</strong> can make it.";
			} else {
				footerText = this.defaultAttendeeText(freeAttendees);
			}
		}

		return footerText;
	},

	buildDateText: function(choiceModel){
		var mom = moment(choiceModel.get("date"));

		var today = new Date();
		today.setHours(0, 0, 0, 0);
		var diff = moment(today).diff(mom, 'days');

		// $(".navbar-fixed-bottom").show();

		var dateText = "";

		if (diff == 0){
			dateText = "Today";
		} else if (diff == -1){
			dateText = "Tomorrow";
		} else if (diff == 1){
			dateText = "Yesterday";
		} else {
			dateText = mom.format("dddd D MMMM");
		}

		return dateText;
	},

	defaultAttendeeText: function(freeAttendees){
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
	},

	addAttendeeClicked: function(){
		this.$el.find('#add-attendee').hide();
		this.$el.find('#email-group').hide();
		this.$el.find('.add-attendee-panel').show();
	},

	addAttendeeLinkClicked: function(){
		var newAttendeeEmail = this.$el.find('#add-attendee-email-input').val();

		$.post("/event/" + window.location.toString().slice(-5) + "/add/", { email: newAttendeeEmail } );
	},

	addAttendeeCancelClicked: function(){
		this.$el.find('#add-attendee').show();
		this.$el.find('#email-group').show();
		this.$el.find('.add-attendee-panel').hide();

		this.$el.find('#add-attendee-email-input').val('');
	}
});
