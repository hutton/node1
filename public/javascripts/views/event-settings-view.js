window.EventSettingsView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.descriptionInputEl = this.$el.find("#settings-description");
		this.descriptionSaveButtonEl = this.$el.find("#settings-description-save");

		this.render();
	},

	savedDescription: null,

	el: $(".event-settings-container"),

	events: {
		"input #settings-description": "descriptionChanged",
		"click #settings-description-save": "descriptionSave"
	},

	render: function(){
		this.descriptionInputEl.elastic();

		this.descriptionInputEl.val(this.model.get('description'));
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
		
	},

	descriptionChanged: function(){
		if (this.descriptionInputEl.val() === this.savedDescription){
			this.descriptionSaveButtonEl.addClass("settings-button-hidden");
		} else {
			this.descriptionSaveButtonEl.removeClass("settings-button-hidden");
		}
	},

	descriptionSave: function(){
		this.savedDescription = this.descriptionInputEl.val();

		this.model.set({description: this.descriptionInputEl.val()});

		this.model.save();

		this.descriptionChanged();
	}
});
