window.AttendeesView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},

	template: _.template($('#attendees-view-template').html()),

	events: {
	},

	render: function(){
		var newElement = this.template({attendees: App.attendees.models, choices: this.collection});

		$('body').append(newElement);

		this.setElement($('.attendees-container-margin').first());

		var newElementRow = this.$el.find('.attendees-choices-row');

		_.each(this.collection.models, function(choice){
			var newAttendeeView = new AttendeeView({model: choice});

			newElementRow.append(newAttendeeView.$el);
		});


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
