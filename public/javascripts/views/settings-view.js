window.SettingsView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();
	},

	el: $("#settings-view"),

	events: {
		"click #settings-update-dates": "updateSelectableDates",
		"click #settings-your-details": "yourDetailsClicked"
	},

	render: function(){
        if (window.App.newMode){
            this.$el.find(".current-attendee-info").hide();
        } else {
            this.$el.find(".current-attendee-info").show();

            var email = window.App.currentAttendee.get("email");
            var prettyName = window.App.currentAttendee.get("prettyName");

            this.$el.find(".current-email").html(email);

            if (email !== prettyName){
                this.$el.find("#current-name").val(prettyName);
            }

            this.$el.find("#current-name-id").val(window.App.currentAttendee.get("id"));

            this.$el.find("#update-name-form").attr("action", "/event/" + window.App.currentId + "/update-name/");
        }

        if (window.App.newMode){
            this.$el.find("#add-attendee").hide();

            this.$el.find('#register-footer').show();
        }
	},

	show: function(){
		this.$el.modal({show: true});
	},

	hide: function(){
		this.$el.modal('hide');
	},

	updateSelectableDates: function(){
		App.AttendeesView.hide();

		window.App.changeSelectableDates();

		this.hide();
	},

	yourDetailsClicked: function(){
		this.$el.find('.settings-your-details-section').slideToggle('fast');

		this.$el.find('#settings-your-details .fa-chevron-right').toggleClass('rotate');
	}
});
