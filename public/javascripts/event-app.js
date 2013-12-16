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

		if (_.isUndefined(this.currentAttendee)){
			this.currentAttendee = null;
		}

		this.ChoicesView = new ChoicesView({collection: this.choices, attendees: this.attendees});

		this.ChoicesView.render();

		var pathNames = window.location.pathname.split( '/' );

		this.currentId = pathNames[pathNames.length - 1];

		this.render();
	},

	el: $("body"),

	events: {
		"click #show-info":				"infoClicked",
		"click .title":					"infoClicked",
		"click .event-table":			"eventTableClicked",
		"click":						"eventTableClicked",
//		"click #add-attendee":			"addAttendeeClicked",
		"click #add-attendee-link":		"addAttendeeLinkClicked",
		"click #add-attendee-cancel-link": "addAttendeeCancelClicked",
		"keyup #add-attendee-email-input": "addAttendeeInputChanged",
		"keyup #register-attendee-email-input": "registerAttendeeInputChanged"
	},

	selectedRowTemplate: _.template($('#selected-row-template').html()),

	isFree: [],

	wasFree: [],

	infoClicked: function(){
		this.$el.find(".info").slideToggle("fast");

		this.$el.find("#show-info > span").toggleClass("show-info-rotate");
	},

	topNavBarEl: $(".navbar-fixed-top"),

	render: function(){
		var that = this;

		this.$el.find(".title").html(this.model.get("name"));

		var nameList = "";	
		_.each(this.attendees.models, function(model){
			if (model.get("me")){
				nameList = "<strong>" + model.get("prettyName") + "</strong>, " + nameList;
			} else {
				nameList = nameList + model.get("prettyName") + ", ";
			}
		});

		nameList = nameList.slice(0, -2);

		this.$el.find(".attendees").html(nameList);

		if (this.currentAttendee === null){
			this.$el.find("#add-attendee").hide();

			$('#register-modal').modal('show');

			this.registerFooterEl.slideDown('fast');
		} else {
			if (this.showWelcome){
				$('#welcome-modal').modal('show');
			}
		}

		this.$el.find("#register-form").attr("action", "/event/" + this.currentId + "/add/");

		$(window).on("scrollstart touchmove", function(){
			that.topNavBarEl.addClass("faded");
		});
		$(window).on("scrollstop", function(){
			that.topNavBarEl.removeClass("faded");
		});
	},

	eventTableClicked: function(event){
		if ($(event.target).parents("td.date-cell").length === 0){
			this.removeSelectedRow();
			$(".selected").removeClass('selected');
		}
	},

	updateSelectedItem: function(choiceModel, selectedRow){
		//var dateText = this.buildDateText(choiceModel);
		var attendeeText = this.buildAttendeeText(choiceModel);

		if (!selectedRow.next().hasClass("selected-row")){
			this.removeSelectedRow();

			this.showSelectedRowAfter(selectedRow, {attendeeText: attendeeText});
		} else {
			// var footerDateEl = this.$el.find(".info-row-date");
			var footerTextEl = this.$el.find(".info-row-text");

			// footerDateEl.html(dateText);
			footerTextEl.html(attendeeText);
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
		var allSelectedRows = $('#selected-row');

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
		var currentAttendeeId = window.App.currentAttendee != null ? window.App.currentAttendee.get("_id") : -1;
		var freeAttendees = choiceModel.get("free");

		if (_.isUndefined(freeAttendees) || freeAttendees.indexOf(currentAttendeeId) == -1){
			// You're not free
			if (_.isUndefined(freeAttendees) || freeAttendees.length === 0){
				footerText = "<strong>Nobody</strong> is free yet.";
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
			text = "Just <strong>you</strong> are free so far.";
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
		var that = this;

		if (!this.isEmailAddressValid(this.$el.find('#add-attendee-email-input').val())){
			that.$el.find(".add-attendee-message").slideDown('fast');
			that.$el.find(".add-attendee-message").text("Invalid email address.");
			return;
		}

		var newAttendeeEmail = this.$el.find('#add-attendee-email-input').val();
		var container = this.$el.find('.add-attendee-panel');
		var spinner = this.$el.find('.add-attendee-email-spinner');

		this.$el.find(".add-attendee-message").hide();
		this.$el.find('.add-attendee-email-validation').hide();
		this.$el.find(".add-attendee-message").text("");

		container.addClass('disabled');
		spinner.show();

		$.post("/event/" + this.currentId + "/add/",
			{
				email: newAttendeeEmail
			},
			function(data){
				that.attendees.add(data);

				that.render();

				that.$el.find('#add-attendee-email-input').val('');
				that.addAttendeeInputChanged();
			}
		)
		.fail(function() {
			that.$el.find(".add-attendee-message").slideDown('fast');
			that.$el.find(".add-attendee-message").text("Whao! Something didn't quite work there. Reload and try again?!");
		})
		.always(function() {
			that.$el.find('.add-attendee-email-validation').show();
			container.removeClass('disabled');
			spinner.hide();
		});
	},

	addAttendeeCancelClicked: function(){
		this.$el.find('#add-attendee').show();
		this.$el.find('#email-group').show();
		this.$el.find('.add-attendee-panel').hide();

		this.$el.find('#add-attendee-email-input').val('');

		this.$el.find(".add-attendee-message").hide();
		this.$el.find(".add-attendee-message").text("");
		this.$el.find('.add-attendee-email-validation').removeClass('add-attendee-email-validation-valid');
	},

	addAttendeeInputChanged: function(){
		var check = this.$el.find('.add-attendee-email-validation');
		var addAttendeeMessage = this.$el.find('.add-attendee-message');

		if (this.isEmailAddressValid(this.$el.find('#add-attendee-email-input').val())){
			check.addClass('add-attendee-email-validation-valid');
			addAttendeeMessage.slideUp('fast');
			addAttendeeMessage.text("");
		} else {
			check.removeClass('add-attendee-email-validation-valid');
		}
	},

	registerAttendeeInputChanged: function(event){
		if (event.which != 13){
			var message = $(".register-attendee-message");

			message.html("");
			messages.slideUp('fast');
		}
	},

	isEmailAddressValid: function(email){
			//var re = /([a-zA-Z0-9\._-])+@([a-zA-Z0-9\._-])+/;
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		var matches = email.match(re);

		return !_.isUndefined(matches) && matches !== null;
	},

	changesMadeLinkkeyEl: $(".changes-made-email-link"),

	updatedFooterEl: $("#updated-footer"),

	registerFooterEl: $("#register-footer"),

	titleMailEl: $("#title-mail"),

	topRowSpacerEl: $("#top-row-spacer"),

	switchedUpdateAttendeesLink: false,

	updateTellEveryoneLink: function(){
		var mailTo = "mailto:" + this.model.get("id") + "@convenely.com?subject=RE:" + encodeURIComponent(" " +this.model.get("name")) + "&body=" + encodeURIComponent(this.formatUpdatedDays(this.isFree, this.wasFree));

		this.changesMadeLinkkeyEl.attr("href", mailTo);

		if (this.isFree.length > 0 || this.wasFree.length > 0){
			if (!this.switchedUpdateAttendeesLink){
				this.updatedFooterEl.show();

				// var adjustHeight = 44 + this.topRowSpacerEl.height();

				// this.topRowSpacerEl.animate({height: adjustHeight}, 200);

				this.switchedUpdateAttendeesLink = true;

				var that = this;

				_.delay(function(){
					that.swtichUpdateAttendeesLink();
				}, 2000);
			}
		}
	},

	swtichUpdateAttendeesLink: function(){
		this.titleMailEl.show();

		var targetOffset = this.$el.find('#changes-made-banner > .fa-envelope-o').offset();
		var sourceOffset = this.titleMailEl.find('.fa-envelope-o').offset();

		this.titleMailEl.hide();

		var newTop = (targetOffset.top - sourceOffset.top) + 6;
		var newLeft = (targetOffset.left - sourceOffset.left) + 8;

		var that = this;

		this.titleMailEl.css({ "left": newLeft + "px", "top": newTop + "px", "-webkit-transform": "scale(0.7,0.7)" });

		_.delay(function(){
			that.titleMailEl.show();

			that.$el.find('#changes-made-banner > .fa-envelope-o').hide();

			that.updatedFooterEl.slideUp('fast');

			_.delay(function(){
				that.titleMailEl.removeAttr("style");
			}, 10);
		}, 10);
	},

	formatUpdatedDays: function(isFree, wasFree){
		if (isFree.length > 0){
			if (wasFree.length > 0) {
				return "I'm now free on " + this.buildDatesString(isFree) + " but I'm no longer free on " + this.buildDatesString(wasFree) + ".";
			} else {
				return "I'm now free on " + this.buildDatesString(isFree) + ".";
			}
		} else if (wasFree.length > 0){
			return "I'm no longer free on " + this.buildDatesString(wasFree) + ".";
		}

		return "";
	},

	buildDatesString: function(dates){
		var text = "";

		dates = dates.sort(function(date1, date2){
			return date1 > date2;
		});

		var datesFormatted = _.map(dates, function(date){
			return moment(date).format("dddd Do MMMM");
		});

		if (datesFormatted.length > 0){
			if (datesFormatted.length == 1){
				text = text + datesFormatted[0];
			} else {
				text = text + datesFormatted.slice(0, -1).join(", ") + " and " + datesFormatted[datesFormatted.length - 1];
			}
		}

		return text;
	},

	validateEmail: function(){
		var email = $("#register-attendee-email-input");

		var message = $(".register-attendee-message");

		if (email.val() === null || email.val() === ""){
			message.html("Please enter your email address");
			message.slideDown('fast');

			return false;
		}

		if (!this.isEmailAddressValid(email.val())){
			message.html("Please enter a valid email address");
			message.slideDown('fast');

			return false;
		}
	}
});
