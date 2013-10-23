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
			var deg = this.calcDegrees(bootstrappedAttendees.length, this.model.get("free").length);

			this.$el.find(".pie").data("value", deg);

			if (deg > 180){
				this.$el.find(".pie").addClass("big");
			}

			// if (this.model.get("free"))
		}

		return this;
	},

	calcDegrees: function(total, count){
		return (count / total) * 360;
	}
});
