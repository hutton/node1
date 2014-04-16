window.ChoicesModel = Backbone.Collection.extend({
 	model: ChoiceModel,

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
	}
});