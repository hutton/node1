window.AttendeesView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},

	template: _.template($('#attendees-view-template').html()),

	events: {
		"scroll .attendees-choices-list-content" : "onScroll"
	},

	isActive: false,

	monthStartChoices: [],

	render: function(){
		var that = this;

		var newElement = $(this.template({attendees: App.attendees.models, choices: this.collection}));

		var newElementRow = newElement.find('.attendees-choices-row');

		var choices = _.filter(this.collection.models, function(choice){
			return choice.get('date') >= App.today;
		});

		var daysPassed = 0;
		var prevMonthChoice = choices[0];

		prevMonthChoice.showMonth = true;
		prevMonthChoice.daysIn = 0;

		_.each(choices, function(choice){
			if (choice.get('date').getDate() == 1){
				prevMonthChoice.lastDay = daysPassed;

				choice.showMonth = true;
				choice.daysIn = daysPassed;
				prevMonthChoice = choice;
			} else {
				choice.showMonth = false;
			}

			daysPassed++;
		});

		choices[0].showMonth = true;

		prevMonthChoice.lastDay = daysPassed;

		_.each(choices, function(choice){
			var newAttendeeView = new AttendeeView({model: choice});

			newElementRow.append(newAttendeeView.$el);

			if (choice.showMonth){
				that.monthStartChoices.push(newAttendeeView);
			}
		});

		$('body').append(newElement);

		this.setElement($('.attendees-container-margin').first());

		this.attendeesChoiceListContainerEl = $(".attendees-choices-list-content");

		this.attendeesChoiceListContainerEl.on("scroll", this.onScroll);

		this.rendered = true;
	},

	resize: function(){
		if (this.isActive){
			console.log("Resize - Attendees");
		}
	},

	rendered: false,

	active: function(isActive){

		this.isActive = isActive;

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

	onScroll: function(event){
		console.log("scroll");
		var scrollLeft = this.attendeesChoiceListContainerEl.scrollLeft();

		_.each(this.monthStartChoices, function(attendeeView){
			attendeeView.adjustMonth(scrollLeft);
		});
	}
});

window.AttendeeView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();
	},

	itemWidth: 70,

	template: _.template($('#attendees-choice-view-template').html()),

	events: {
	},

	tagName: "td",

	adjustMonth: function(scrollLeft){
		if (scrollLeft > this.model.daysIn * this.itemWidth && scrollLeft < (this.model.lastDay -2) * this.itemWidth){
			var moveLeft = scrollLeft - (this.model.daysIn * this.itemWidth);

			this.$el.find('.attendees-choice-month').attr("style", "left: " + moveLeft + "px");
		}
	},

	render: function(){
		this.$el.html(this.template({attendees: App.attendees.models, choice: this.model}));
	},
});
