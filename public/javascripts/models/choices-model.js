window.ChoicesModel = Backbone.Collection.extend({
	initialize: function() {
		this.listenTo(App.attendees, "remove", this.attendeeRemoved);
	},

 	model: ChoiceModel,

	totalSelectable: function(){
		var total = 0;

		return this.where({selectable: true}).length;
	},

	totalChoices: function(){
		var total = 0;

		_.each(this.models, function(choice){
			var free = choice.get('free');

			if (!_.isUndefined(free)){
				total += choice.get('free').length;
			}
		});

		return total;
	},

	choicesForAttendee: function(attendeeId){
		var total = 0;

		_.each(this.models, function(choice){
			var free = choice.get('free');

			if (!_.isUndefined(free) && free.indexOf(attendeeId) !== -1){
				total += 1;
			}
		});

		return total;
	},

	firstAndLastDates: function(){
		var first = null;
		var last = null;

		_.each(this.models, function(choice){
			if (choice.get('selectable')){
				if (first === null){
					first = choice.get('date');
				}

				last = choice.get('date');
			}
		});

		return {first: first, last: last};
	},

	attendeeRemoved: function(model){
		var attendeeId = model.get("id");

		_.each(this.models, function(choice){
			var free = choice.get('free');

			if (!_.isUndefined(free)){
				var index = free.indexOf(attendeeId);

				if (index !== -1){
					free.splice(index, 1);
				}
			}

			choice.trigger('reset');
		});
	}
});