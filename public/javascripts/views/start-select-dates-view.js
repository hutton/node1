window.StartSelectDatesView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();
	},

	el: $("#new-mode-start-select-dates-view"),

	events: {
		"click #start-select-dates-custom": "selectCustomRange"
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
	}
});
