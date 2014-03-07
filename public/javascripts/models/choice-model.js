window.ChoiceModel = Backbone.Model.extend({

	initialize: function() {
		var pathNames = window.location.pathname.split( '/' );

		this.url = "/event/" + pathNames[pathNames.length - 1] + "/choice/";

	},

	url: "",

	pretendFree: false,

	isFree: function(){
		if (window.App.newMode){
			return this.pretendFree;
		} else {
			var currentAttendeeId = window.App.currentAttendee.get("_id");

			return this.isAttendeeFree(currentAttendeeId);
		}

		return false;
	},

	isAttendeeFree: function(attendeeId){
		if (attendeeId === "new"){
			return this.pretendFree;
		}

		if (attendeeId !== null){
			var freeAttendees = this.get("free");

			if (_.isUndefined(freeAttendees) || freeAttendees.indexOf(attendeeId) == -1){
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

		if (!window.App.newMode){
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

		window.App.showBestChoices();
	},

	setTopChoice: function(value){
        if (!this.has('top-choice') ||
            (this.has('top-choice') && this.get('top-choice') !== value)){
            this.set('top-choice', value);
        }
	},

	getAttendeeAvailability: function(){
		var that = this;
		var list = [];

		_.each(App.attendees.models, function(attendee){
			if (that.isAttendeeFree(attendee.get("_id"))){
				list.push(true);
			} else {
				list.push(false);
			}
		});

		return list;
	}
});
