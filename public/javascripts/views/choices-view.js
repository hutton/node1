window.ChoiceView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},

	template: _.template($('#choice-template').html()),

	events: {
		"click div:first":	"dayClicked"
	},

	pie: null,

	render: function(){
		this.$el.html(this.template(this.model.attributes));

		this.pie = this.$el.find(".pie");

		var date = this.model.get("date").getDate();

		if (date == 1){
			this.$el.addClass("first");
		}

		if (date >= 2 && date <= 7){
			this.$el.addClass("first-seven");
		}

		this.updateFreeCounter(false);

		return this;
	},

	updateFreeCounter: function(animate){
		if (this.model.has("free")){
			var freeDates = this.model.get("free");

			this.targetDeg = this.calcDegrees(window.App.attendees.length, freeDates.length);

			if (animate){
				this.animatePie();
			} else {
				this.pie.attr("data-value", this.targetDeg);

				if (this.targetDeg >= 180){
					this.pie.addClass("big");
				} else {
					this.pie.removeClass("big");
				}
			}

			if (window.App.currentAttendee !== null && freeDates.indexOf(window.App.currentAttendee.get("_id")) != -1){
				this.$el.find(".unknown").addClass("free").removeClass("unknown");
			}
		}
	},

	animatePie: function(){
		var current = parseInt(this.pie.attr("data-value"));
		var change = 0;

		if (current < this.targetDeg){
			change = 10;
		}

		if (current > this.targetDeg){
			change = -10;
		}

		if (change !== 0){
			this.pie.attr("data-value", current + change);

			if (current + change >= 180){
				this.pie.addClass("big");
			} else {
				this.pie.removeClass("big");
			}

			_.delay(this.animatePie, 15);
		}
	},

	dayClicked: function(event){
		var target = $(this.$el).find("div:first");

		if (target.hasClass('selected')){
			target.find('div:nth-of-type(2)').toggleClass('free');
			target.find('div:nth-of-type(2)').toggleClass('unknown');

			this.toggleFree();
		} else {
			$(".selected").removeClass('selected');

			target.addClass('selected');
		}
	},

	toggleFree: function(){
		var currentAttendeeId = window.App.currentAttendee.get("_id");
		var freeDates = this.model.get("free");

		if (_.isUndefined(freeDates) || freeDates.indexOf(currentAttendeeId) == -1){
			if (_.isUndefined(freeDates)){
				this.model.set("free", [currentAttendeeId]);
			} else {
				freeDates.push(currentAttendeeId);
			}
		} else {
			freeDates.removeElement(currentAttendeeId);
		}

		this.updateFreeCounter(true);

		this.model.save();
	},

	calcDegrees: function(total, count){
		return Math.round((count / total) * 36) * 10;
	}
});

window.ChoicesView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		var that = this;
	
		this._choiceViews = [];
	 
		this.collection.each(function(choice) {
			that._choiceViews.push(new ChoiceView({
			model : choice,
			tagName : 'td'
			}));
		});
	},

	el: $(".event-table"),

	events: {
	},

	render: function(){
		var that = this;

		$(this.el).empty();

		var row = null;

		_(this._choiceViews).each(function(choice) {
			if (choice.model.get("date").getDay() == 1){
				$(that.el).append($("<tr></tr>"));

				row = $(that.el).find("tr:last");
			}

			if (row !== null){
				row.append(choice.render().el);
			}
		});

		return this;
	}
});