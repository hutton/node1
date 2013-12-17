window.ChoiceModel = Backbone.Model.extend({

	initialize: function() {
		var pathNames = window.location.pathname.split( '/' );

		this.url = "/event/" + pathNames[pathNames.length - 1] + "/choice/";

	},

	url: "",

	isFree: function(){
		if (window.App.currentAttendee != null){
			var currentAttendeeId = window.App.currentAttendee.get("_id");
			var freeAttendees = this.get("free");

			if (_.isUndefined(freeAttendees) || freeAttendees.indexOf(currentAttendeeId) == -1){
				return false;
			} else {
				return true;
			}
		}

		return false;
	},

	toggleFree: function(){
		var date = this.get("date");

		if (window.App.currentAttendee != null){
			var currentAttendeeId = window.App.currentAttendee.get("_id");
			var freeAttendees = this.get("free");

			if (_.isUndefined(freeAttendees) || freeAttendees.indexOf(currentAttendeeId) == -1){
				if (_.isUndefined(freeAttendees)){
					this.set("free", [currentAttendeeId]);
				} else {
					freeAttendees.push(currentAttendeeId);

					this.trigger('change');
				}

				if (window.App.wasFree.indexOf(date) != -1){
					window.App.wasFree.removeElement(date);
				} else {
					window.App.isFree.push(this.get("date"));
				}

			} else {
				freeAttendees.removeElement(currentAttendeeId);

				this.trigger('change');

				if (window.App.isFree.indexOf(date) != -1){
					window.App.isFree.removeElement(date);
				} else {
					window.App.wasFree.push(this.get("date"));
				}
			}

			this.save();

			window.App.updateTellEveryoneLink();
		} else {
			if (window.App.isFree.indexOf(date) != -1){
				window.App.isFree.removeElement(date);
			} else {
				window.App.isFree.push(this.get("date"));
			}
		}
	}
});
