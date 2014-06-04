window.EventSettingsView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();
	},

	el: $(".event-settings-container"),

	events: {
	},

	render: function(){
	},

	show: function(){
		this.$el.show();

		this.$el.removeClass('event-settings-container-hidden');
	},

	hide: function(){
		var that = this;
		
		this.$el.addClass('event-settings-container-hidden');

		_.delay(function(){
			that.$el.hide();
		}, 400);
		
	}
});
