window.EventSettingsAttendeeView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();

		this.removeEl = this.$el.find('.settings-attendee-remove');
		this.buttonsEl = this.$el.find('.settings-attendee-buttons');
		this.buttons = this.$el.find('button');

		this.listenTo(this.model, "destroy", this.attendeeRemoved);
	},

	template: _.template($('#settings-attendee-view-template').html()),

	events: {
		"click .settings-attendee-remove": "removeClicked",
		"click .settings-button-cancel": "cancelClicked",
		"click .settings-button-delete": "deleteClicked"
	},

	render: function(){
		this.$el.html(this.template({name: this.model.get("prettyName"), email: this.model.get("email")}));
	},

	removeClicked: function(){
		var that = this;

		this.removeEl.hide();

		this.buttonsEl.slideDown('fast');

		_.delay(function(){
			that.buttons.removeClass('settings-button-hidden');
		}, 10);
	},

	cancelClicked: function(){
		this.closeButtons();
	},

	closeButtons: function(){
		var that = this;

		that.buttons.addClass('settings-button-hidden');

		_.delay(function(){
			that.buttonsEl.slideUp('fast');

			that.removeEl.show();
		}, 400);
	},

	deleteClicked: function(){
		this.model.destroy();
	},

	attendeeRemoved: function(){
		var that = this;

		this.$el.slideUp('fast', function(){
			that.remove();
		});
	}
});
