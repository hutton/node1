window.InfoRowView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.attendees = window.App.attendees;

		this.listenTo(this.model, "change", this.modelChanged);

		this.render();
	},

	template: _.template($('#selected-row-template').html()),

	events: {
	},

	showingDetails: false,

	initialise: function(){
		_.bindAll(this);
	},

	render: function(){
		this.showSelectedRowAfter(this.buildTemplateValues());

		return this;
	},

	updateModel: function(model){
		this.stopListening(this.model);

		this.model = model;

		this.listenTo(this.model, "change", this.modelChanged);
	},

	modelChanged: function(){
		var values = this.buildTemplateValues();

		var footerTextEl = this.infoRowEl.find(".info-row-text");

		footerTextEl.html(values.attendeeText);

		if (this.model.isFree() || this.model.pretendFree){
			this.infoRowEl.find('.info-row-selector-free').addClass('info-row-selector-free-show');
		} else {
			this.infoRowEl.find('.info-row-selector-free').removeClass('info-row-selector-free-show');
		}

		this.infoRowEl.find('.info-row-names').html("<strong>" + values.freeNames + "</strong>" + values.notFreeNames);

		if (values.showTopChoice){
			this.infoRowEl.find('.info-row-top-choice').show();
			this.infoRowEl.find('.info-row-top-choice > div').html(values.topChoiceText);
		} else {
			this.infoRowEl.find('.info-row-top-choice').hide();
		}
	},

	buildTemplateValues: function(){
		var freeAttendees = this.model.get("free") || [];

		var free = [];
		var busy = [];

		_.each(this.attendees.models, function(att){
			var found = freeAttendees.indexOf(att.get('_id'));

			if (found != -1){
				free.push(att.get('prettyName'));
			} else {
				busy.push(att.get('prettyName'));
			}
		});

		freeNamesText = free.join(', ');

		if (busy.length > 0 && free.length > 0){
			freeNamesText = freeNamesText + ", ";
		}

		var date = this.model.get('date');

		var dateText = moment(date).format("dddd D MMMM");

		var topChoice = 0;
		var topChoiceText = "";

		if (this.model.has('top-choice')){
			topChoice = this.model.get('top-choice');

			if (topChoice === 1){
				topChoiceText = "Top choice";
			} else if (topChoice === 2){
				topChoiceText = "2nd choice";
			} else if (topChoice === 3){
				topChoiceText = "3rd choice";
			} 
		}

		var showTopChoice = topChoice > 0;

		return {
			attendeeText: this.buildAttendeeText(this.model),
			isFree: this.model.isFree(),
			showInvite: window.App.currentAttendeeId !== -1 && App.attendees.length === 1,
			showDetails: true, //this.showingDetails,
			freeNames: freeNamesText,
			date: dateText,
			notFreeNames: busy.join(', '),
			showTopChoice: false,  //showTopChoice,
			topChoiceText: topChoiceText
		};
	},

	update: function(model, selectedRow){
		this.updateModel(model);

		if (!selectedRow.next().hasClass("selected-row")){
			// On a different row
			this.removeSelectedRow();

			this.setElement(selectedRow);
			
			this.render();
		} else {
			this.modelChanged();
		}
	},

	showDetails: function(){
		this.infoRowEl.find('#info-row-details-link').hide();
		this.infoRowEl.find('#info-row-hide-details-link').show();
		this.infoRowEl.find('.info-row-names').slideDown('fast');

		this.showingDetails = true;
	},

	hideDetails: function(){
		this.infoRowEl.find('#info-row-details-link').show();
		this.infoRowEl.find('#info-row-hide-details-link').hide();
		this.infoRowEl.find('.info-row-names').slideUp('fast');

		this.showingDetails = false;
	},

	panelClicked: function(event){
		var target = $(event.target);

		if (event.target.id !== "info-row-hide-details-link" &&
			event.target.id !== "info-row-details-link"){

			this.removeSelectedRow();
		}
	},

	setAsFree: function(){
		this.model.toggleFree();
	},

	showSelectedRowAfter: function(templateValues){
		var that = this;

		this.$el.after(this.template(templateValues));

		this.unbindEvents();

		this.infoRowEl = this.$el.next().find('.info-row');

		this.bindEvents();

		this.$el.next()
			.find('td')
			.wrapInner('<div style="display: none;" />')
			.parent()
			.find('td > div')
			.slideDown(200, function(){
				var $set = $(this);
				$set.replaceWith($set.contents());
			});
	},

	unbindEvents: function(){
		if (this.infoRowEl !== null && !_.isUndefined(this.infoRowEl) ){
			this.infoRowEl.find('.info-row-text-container').off('click', this.panelClicked);

			this.infoRowEl.find('.info-row-selector').off('click', this.setAsFree);
			this.infoRowEl.find('.info-row-selector-free').off('click', this.setAsFree);

			this.infoRowEl.find('#info-row-details-link').off('click', this.showDetails);
			this.infoRowEl.find('#info-row-hide-details-link').off('click', this.hideDetails);
		}
	},

	bindEvents: function(){
		this.infoRowEl.find('.info-row-text-container').on('click', this.panelClicked);

		this.infoRowEl.find('.info-row-selector').on('click', this.setAsFree);
		this.infoRowEl.find('.info-row-selector-free').on('click', this.setAsFree);

		this.infoRowEl.find('#info-row-details-link').on('click', this.showDetails);
		this.infoRowEl.find('#info-row-hide-details-link').on('click', this.hideDetails);
	},

	removeSelectedRow: function(){
		$(".selected").removeClass('selected');

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
		var freeAttendees = choiceModel.get("free");

		if (window.App.currentAttendeeId !== -1 && App.attendees.length === 1){
			footerText = "Only you are invited";
		} else {
			if (_.isUndefined(freeAttendees)){
				footerText = "0 of " + App.attendees.length + " people are free";

			} else {
				footerText = freeAttendees.length + " of " + App.attendees.length + " people are free";
			}
		}

		return footerText;
	},

	buildAttendeeTextOld: function(choiceModel){
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

});
