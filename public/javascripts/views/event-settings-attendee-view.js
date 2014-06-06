window.EventSettingsAttendeeView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();

		this.removeEl = this.$el.find('.settings-attendee-remove');
		this.buttons = this.$el.find('button');
	},

	template: _.template($('#settings-attendee-view-template').html()),

	events: {
		"click .settings-attendee-remove": "removeClicked",
		"click .settings-button-cancel": "cancelClicked"
	},

	render: function(){
		this.$el.html(this.template({name: this.model.get("prettyName"), email: this.model.get("email")}));
	},

	removeClicked: function(){
		var that = this;

		this.removeEl.hide();

		this.buttons.show();

		_.delay(function(){
			that.buttons.removeClass('settings-button-hidden');
		}, 10);
	},

	cancelClicked: function(){
		var that = this;

		that.buttons.addClass('settings-button-hidden');

		_.delay(function(){
			that.buttons.removeClass('settings-button-hidden');

			that.buttons.hide();

			that.removeEl.show();
		}, 400);
	}
});
