window.SettingsView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();
	},

	el: $("#settings-view"),

	events: {
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

            this.$el.find("#current-name-id").val(window.App.currentAttendee.get("_id"));

            this.$el.find("#update-name-form").attr("action", "/event/" + window.App.currentId + "/update-name/");
        }

        var nameList = "";  
        _.each(window.App.attendees.models, function(model){
            if (model.get("me")){
                nameList = "<strong>" + model.get("prettyName") + "</strong>, " + nameList;
            } else {
                nameList = nameList + model.get("prettyName") + ", ";
            }
        });

        nameList = nameList.slice(0, -2);

        this.$el.find(".attendees").html(nameList);

        if (window.App.newMode){
            this.$el.find("#add-attendee").hide();

            this.$el.find('#register-footer').show();
        }
	},

	show: function(){
		this.$el.modal({show: true});
	},

	hide: function(){
		this.$el.modal({show: false});
	}
});
