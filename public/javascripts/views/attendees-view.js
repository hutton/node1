window.AttendeesView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},

	template: _.template($('#attendees-view-template').html()),

	events: {
		"click .attendees-close": "onClose"
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
			speed: 800,
			easing: 'easeOutExpo',
			elasticBounds: 1,
			dragHandle: 1,
			dynamicHandle: 1,
			clickBar: 1,
		}, {
			active: that.itemActive
		});

		var selectedModel = this.collection.findWhere({selected: true});

		this.sly.init();

		this.resize();

		this.rendered = true;

		this.setActive(selectedModel);
	},

	itemActive: function(event, index){
		App.setSelected(this.usedChoices[index]);
	},

	setActive: function(model){
		if (this.rendered){
			var index = this.usedChoices.indexOf(model);

			if (index !== -1){
				this.sly.toCenter(index);
			}
		}
	},

	resize: function(){
		if (this.isActive){
		}
	},

	rendered: false,

	showing: false,

	show: function(){
		if (!this.showing){
			if (!this.rendered){
				this.render();
			}

			$('.day-view-container').append(this.$el);

			this.setHeight(true);

			App.scrollToSelected();
		}

		this.showing = true;
	},

	hide: function(){
		var that = this;

		this.showing = false;

		this.$el.find('.attendees-choices-list-container').animate({height: 0}, 400, function(){
			that.$el.detach();
		});	
	},

	onClose: function(){
		this.$el.find('.attendees-close').addClass('attendees-close-hidden');

		this.hide();
	},

	setHeight: function(animate){
		var that = this;

		var windowHeight = $(window).height();
		var navBarHeight = $('.navbar-fixed-top').height();

		var itemHeight = $('.date-cell').first().height();

		var maxHeight = Math.min(windowHeight - (navBarHeight + (itemHeight * 3)), 420);

		this.$el.find('.attendees-choices-list-container').animate({height: maxHeight}, 400, function(){
			that.$el.find('.attendees-close').removeClass('attendees-close-hidden');
		});
	},

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

	render: function(){
		this.$el.html(this.template({attendees: App.attendees.models, choice: this.model}));

		this.monthLabelEl = this.$el.find('.attendees-choice-month > div');
	},

	modelChanged: function(){
		var that = this;
		var attendeeCount = 0;

		var items = this.$el.find('.att-ch');

		items.removeClass('attendee-free');

		console.log("Attendees - model changed");

		var check = this.$el.find('.attendees-choice-state');

		if (this.model.isFree()){
			check.addClass('attendees-choice-state-free');
		} else {
			check.removeClass('attendees-choice-state-free');
		}

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
