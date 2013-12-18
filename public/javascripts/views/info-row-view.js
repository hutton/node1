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

	initialise: function(){
		_.bindAll(this);
	},

	render: function(){
		var attendeeText = this.buildAttendeeText(this.model);

		this.showSelectedRowAfter({attendeeText: attendeeText, isFree: this.model.isFree()});

		return this;
	},

	updateModel: function(model){
		this.stopListening(this.model);

		this.model = model;

		this.listenTo(this.model, "change", this.modelChanged);
	},

	modelChanged: function(){
		var attendeeText = this.buildAttendeeText(this.model);

		var footerTextEl = this.infoRowEl.find(".info-row-text");

		footerTextEl.html(attendeeText);

		if (this.model.isFree()){
			this.infoRowEl.find('.info-row-selector-free').addClass('info-row-selector-free-show');
		} else {
			this.infoRowEl.find('.info-row-selector-free').removeClass('info-row-selector-free-show');
		}
	},

	update: function(model, selectedRow){
		this.updateModel(model);

		var attendeeText = this.buildAttendeeText(this.model);

		if (!selectedRow.next().hasClass("selected-row")){
			// On a different row
			this.removeSelectedRow();

			this.setElement(selectedRow);
			
			this.render();
		}
	},

	setAsFree: function(){
		this.model.toggleFree();
	},

	showSelectedRowAfter: function(templateValues){
		var that = this;

		this.$el.after(this.template(templateValues));

		this.$el.next()
			.find('td')
			.wrapInner('<div style="display: none;" />')
			.parent()
			.find('td > div')
			.slideDown(200, function(){
				var $set = $(this);
				$set.replaceWith($set.contents());
				
				that.unbindEvents();

				that.infoRowEl = $('.info-row');

				that.bindEvents();
			});
	},

	unbindEvents: function(){
		if (this.infoRowEl !== null && !_.isUndefined(this.infoRowEl) ){
			this.infoRowEl.find('.info-row-selector').off('click', this.setAsFree);	
			this.infoRowEl.find('.info-row-selector-free').off('click', this.setAsFree);
		}
	},

	bindEvents: function(){
		this.infoRowEl.find('.info-row-selector').on('click', this.setAsFree);
		this.infoRowEl.find('.info-row-selector-free').on('click', this.setAsFree);
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

		footerText = freeAttendees.length + " of " + App.attendees.length + " people are free";

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
