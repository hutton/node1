window.ChoiceModel = Backbone.Model.extend({

	initialize: function() {
		var pathNames = window.location.pathname.split( '/' );

		this.url = "/event/" + pathNames[pathNames.length - 1] + "/choice/";

	},

	url: "",

	pretendFree: false,

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
		var freeAttendees = this.get("free");

		if (window.App.currentAttendee != null){
			var currentAttendeeId = window.App.currentAttendee.get("_id");

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

			window.App.showBestChoices();
		} else {
			if (window.App.isFree.indexOf(date) != -1){
				window.App.isFree.removeElement(date);

				this.pretendFree = false;

				this.trigger('change');
			} else {
				window.App.isFree.push(this.get("date"));

				this.pretendFree = true;

				this.trigger('change');
			}

			$('#register-free-dates').val(window.App.isFree);
		}
	},

	calcBackground: function(){
		var freeDates = 0;

		var redStart = 246;
		var greenStart = 249;
		var blueStart = 246;

		var redEnd = 214;
		var greenEnd = 218;
		var blueEnd = 210;

		var total = window.App.attendees.length;

		if (this.has("free")){
			freeDates = this.get("free").length;
		}

		var percent = (freeDates / total);

		return "rgb(" + this.interpolate(redStart, redEnd, percent) + "," + this.interpolate(greenStart, greenEnd, percent)  + "," + this.interpolate(blueStart, blueEnd, percent) + ")";
	},

	calcForegroundOpacity: function(){
		var freeDates = 0;

		var start = 0.12;
		var end = 0.27;

		var total = window.App.attendees.length;

		if (this.has("free")){
			freeDates = this.get("free").length;
		}

		var percent = (freeDates / total);

		var diff = start - end;

		return start - (percent * diff);
	},

	interpolate: function(start, end, percent){
		var diff = start - end;

		var target = start - (percent * diff);

		target = Math.round(target);

		return target;
	}
});
