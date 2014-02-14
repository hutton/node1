window.AttendeesView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},

	template: _.template($('#attendees-view-template').html()),

	events: {
	},

	render: function(){
		var newElement = $(this.template({attendees: App.attendees.models, choices: this.collection}));

		var newElementRow = newElement.find('.attendees-choices-row');

		var choices = _.filter(this.collection.models, function(choice){
			return choice.get('date') >= App.today;
		});

		_.each(choices, function(choice){
			if (choice.get('date').getDate() == 1){
				choice.showMonth = true;
			} else {
				choice.showMonth = false;
			}
		});

		choices[0].showMonth = true;

		_.each(choices, function(choice){
			var newAttendeeView = new AttendeeView({model: choice});

			newElementRow.append(newAttendeeView.$el);
		});

		$('body').append(newElement);

		this.setElement($('.attendees-container-margin').first());

		this.rendered = true;
	},

	rendered: false,

	active: function(isActive){

		if (isActive){
			if (!this.rendered){
				this.render();
			} else {
				$('body').append(this.$el);
			}

			$('.days-table').hide();

			$('body').scrollTop(0);
		} else {
			this.$el.detach();
			$('.days-table').show();
		}
	},
});

window.AttendeeView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();
	},

	template: _.template($('#attendees-choice-view-template').html()),

	events: {
	},

	tagName: "td",

	render: function(){
		this.$el.html(this.template({attendees: App.attendees.models, choice: this.model}));
	},
});
