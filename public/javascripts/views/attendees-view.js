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

		this.usedChoices = _.filter(this.collection.models, function(choice){
			return choice.get('date') >= App.today && choice.isSelectable();
		});

		var daysPassed = 0;
		var prevMonthChoice = this.usedChoices[0];

		prevMonthChoice.showMonth = true;
		prevMonthChoice.daysIn = 0;

		_.each(this.usedChoices, function(choice){
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

		this.usedChoices[0].showMonth = true;

		prevMonthChoice.lastDay = daysPassed;

		_.each(this.usedChoices, function(choice){
			var newAttendeeView = new AttendeeView({model: choice});

			newElementRow.append(newAttendeeView.$el);

			if (choice.showMonth){
				that.monthStartChoices.push(newAttendeeView);
			}
		});

		$('.day-view-container').append(newElement);

		this.setElement($('.attendees-container-margin').first());

		this.attendeesChoiceListContainerEl = $(".attendees-choices-list-content");

		this.attendeesChoiceListContainerEl.on("scroll", this.onScroll);

		this.sly = new Sly(this.$el.find('.attendees-choices-list-content'),{
			horizontal: 1,
			itemNav: 'forceCentered',
			smart: 1,
			activateMiddle: 1,
			activateOn: 'click',
			mouseDragging: 1,
			touchDragging: 1,
			releaseSwing: 1,
			startAt: 0,
			scrollBy: 1,
			speed: 400,
			easing: 'easeOutExpo',
			elasticBounds: 1,
			dragHandle: 1,
			dynamicHandle: 1,
			clickBar: 1,
		}, {
			active: that.itemActive
		});

		this.sly.init();

		this.resize();

		this.rendered = true;
	},

	itemActive: function(event, index){
		App.setSelected(this.usedChoices[index]);
	},

	setActive: function(model){
		var index = this.usedChoices.indexOf(model);

		if (index !== -1){
			this.sly.toCenter(index);
		}
	},

	resize: function(){
		if (this.isActive){
			// var totalHeight = $(window).height();

			// $('.navbar').each(function(){
			// 	if ($(this).is(':visible')){
			// 		totalHeight -= $(this).height();
			// 	}
			// });

			// totalHeight -= 70;

			// var tableHeight = this.$el.height();

			// if (totalHeight > tableHeight){
			// 	this.$el.attr('style', 'margin-top: ' + (totalHeight - tableHeight) / 2 +'px');
			// } else {
			// 	this.$el.attr('style', null);
			// }
		}
	},

	rendered: false,

	active: function(isActive){

		this.isActive = isActive;

		if (isActive){
			if (!this.rendered){
				this.render();
			} else {
				$('.day-view-container').append(this.$el);
			}

			$(".event-container").css({'padding-bottom': this.$el.height()});
		} else {
			this.$el.detach();

			$(".event-container").css({'padding-bottom': 0});
		}
	},

	onScroll: function(event){
		this.checkScrollPosition();
	},

	scrollPosition: 0,

	checkScrollPosition: function(){
		var that = this;

		var scrollLeft = this.attendeesChoiceListContainerEl.scrollLeft();

		if (scrollLeft !== this.scrollPosition){
			this.scrollPosition = scrollLeft;

			_.each(this.monthStartChoices, function(attendeeView){
				attendeeView.adjustMonth(scrollLeft);
			});

			_.delay(that.checkScrollPosition, 30);
		}
	}
});

window.AttendeeView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();

		this.listenTo(this.model, "change", this.modelChanged);
	},

	itemWidth: 80,

	template: _.template($('#attendees-choice-view-template').html()),

	events: {
		"click .attendees-choice-state": "choiceClicked"
	},

	tagName: "li",

	adjustMonth: function(scrollLeft){
		if (scrollLeft < (this.model.daysIn - 1) * this.itemWidth){
			this.monthLabelEl.show();
		} else { // if (scrollLeft > this.model.daysIn * this.itemWidth && scrollLeft < (this.model.lastDay -2) * this.itemWidth){

			this.monthLabelEl.hide();
		}
	},

	render: function(){
		this.$el.html(this.template({attendees: App.attendees.models, choice: this.model}));

		this.monthLabelEl = this.$el.find('.attendees-choice-month > div');
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
	},

	choiceClicked: function(){
		this.model.toggleFree();
	}
});
