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
		this.checkScrollPosition();
	},

	scrollPosition: 0,

	scrollNotChangedCount: 0,

	checkScrollPosition: function(){
		var that = this;

		var scrollLeft = this.attendeesChoiceListContainerEl.scrollLeft();		

		if (scrollLeft !== this.scrollPosition){
			this.scrollNotChangedCount = 60;

			this.scrollPosition = scrollLeft;

			_.each(this.monthStartChoices, function(attendeeView){
				attendeeView.adjustMonth(scrollLeft);
			});

			_.delay(that.checkScrollPosition, 30);
		} else {
			if (this.scrollNotChangedCount > 0){
				_.delay(that.checkScrollPosition, 30);
			}

			this.scrollNotChangedCount--;
		}
	}
});

window.AttendeeView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();

		this.listenTo(this.model, "change", this.modelChanged);
	},

	itemWidth: 70,

	template: _.template($('#attendees-choice-view-template').html()),

	events: {
	},

	tagName: "td",

	adjustMonth: function(scrollLeft){
		if (scrollLeft < this.model.daysIn * this.itemWidth){
			this.$el.find('.attendees-choice-month').attr("style", "left: 0px");			
			this.$el.find('.attendees-choice-month').show();
		} else if (scrollLeft > (this.model.lastDay -2) * this.itemWidth){
			this.$el.find('.attendees-choice-month').hide();
		} else { // if (scrollLeft > this.model.daysIn * this.itemWidth && scrollLeft < (this.model.lastDay -2) * this.itemWidth){

			$('.attendees-choices-month-container').html(this.$el.find('.attendees-choice-month').html());

			this.$el.find('.attendees-choice-month').hide();
		}
	},

	render: function(){
		this.$el.html(this.template({attendees: App.attendees.models, choice: this.model}));
	},

	modelChanged: function(){
		var that = this;
		var attendeeCount = 0;

		var items = this.$el.find('li > div');

		items.removeClass('attendee-free');

		console.log("Attendees - model changed");

		_.each(App.attendees.models, function(attendee){
			if (that.model.isAttendeeFree(attendee.get("_id"))){
				$(items[attendeeCount]).addClass('attendee-free');
			}

			attendeeCount++;
		});
	}
});
