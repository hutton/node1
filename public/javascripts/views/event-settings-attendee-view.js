window.EventSettingsAttendeeView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();
	},

	template: _.template($('#settings-attendee-view-template').html()),

	events: {
	},

	render: function(){
		this.$el.html(this.template({name: this.model.get("prettyName")}));
	}
});
