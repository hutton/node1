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

window.ChoiceView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},

	template: _.template($('#choice-template').html()),

	events: {
		"click div":	"dayClicked"
	},

	render: function(){
		this.$el.html(this.template(this.model.attributes));

		var date = this.model.get("date").getDate();

		if (date == 1){
			this.$el.addClass("first");
		}

		if (date >= 2 && date <= 7){
			this.$el.addClass("first-seven");
		}

		if (this.model.has("free")){
			var freeDates = this.model.get("free");

			var deg = this.calcDegrees(bootstrappedAttendees.length, freeDates.length);

			this.$el.find(".pie").attr("data-value", deg);

			if (deg >= 180){
				this.$el.find(".pie").addClass("big");
			}

			if (currentAttendee != null && freeDates.indexOf(currentAttendee.get("_id")) != -1){
				this.$el.find(".unknown").addClass("free").removeClass("unknown");
			}
		}

		return this;
	},

	dayClicked: function(event){
		var target = $(this.$el).find("div");

		if (target.hasClass('selected')){
			target.find('div:nth-of-type(2)').toggleClass('free');
			target.find('div:nth-of-type(2)').toggleClass('unknown');
		} else {
			$(".selected").removeClass('selected');

			target.addClass('selected');
		}
	},

	calcDegrees: function(total, count){
		return Math.round((count / total) * 36) * 10;
	}
});
