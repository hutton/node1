window.StartSelectDatesView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();
	},

	el: $("#new-mode-start-select-dates-view"),

	events: {
		"click #start-select-dates-custom": "selectCustomRange",
		"click #start-select-dates-next-month": "selectNextMonth",
		"click #start-select-dates-next-two-months": "selectNextTwoMonths",
		"click #start-select-dates-all": "selectAll"
	},

	selectCustomRange: function(){
		App.changeSelectableDates();
		this.hide();
	},

	render: function(){
	},

	show: function(){
		this.$el.modal({show: true});
	},

	hide: function(){
		this.$el.modal('hide');
	},

	selectNextMonth: function(){
		App.SelectDatesView.oneMonth(false);

		App.SelectDatesView.save();

		this.hide();
	},

	selectNextTwoMonths: function(){
		App.SelectDatesView.twoMonths(false);

		App.SelectDatesView.save();

		this.hide();
	},

	selectAll: function(){
		App.SelectDatesView.all(false);

		App.SelectDatesView.save();

		this.hide();
	}
});
