window.SelectDatesView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.savingEL = $('.selecting-dates-saving-container');
	},

	el: $(".selecting-dates-container"),

	events: {
		"click #selecting-dates-cancel":	"cancel",
		"click #selecting-dates-save":		"save",
		"click #selecting-dates-one-month": "oneMonthClicked",
		"click #selecting-dates-two-months":	"twoMonthsClicked",
		"click #selecting-dates-all":		"allClicked",
		"click #selecting-dates-one-month-weekdays": "oneMonthWeekdaysClicked",
		"click #selecting-dates-two-months-weekdays":	"twoMonthsWeekdaysClicked",
		"click #selecting-dates-all-weekdays":		"allWeekdaysClicked",
		"click #selecting-dates-clear":		"clearClicked"
	},

	show: function(){
		window.App.setSelectableDateMode(true);

		this.$el.slideDown('fast');

		this.originalSelectableChoices = this.collection.where({selectable: true});	
	},

	hide: function(){
		window.App.setSelectableDateMode(false);

		this.$el.slideUp('fast');
	},

	cancel: function(){
		_.each(this.collection.models, function(choice){
			if (choice.has('date')){
				var date = choice.get('date');

				if (date > window.App.today){
					choice.set('selectable', false);
				}
			}
		});

		_.each(this.originalSelectableChoices, function(choice){
			if (choice.has('date')){
				var date = choice.get('date');

				if (date > window.App.today){
					choice.set('selectable', true);
				}
			}
		});

		this.hide();
	},

	save: function(){
		var that = this;
		var selectableChoices = this.collection.where({selectable: true});

		var selectableDates = _.map(selectableChoices, function(choice){
			return choice.get('date');
		});

		var data = JSON.stringify(selectableDates);

		this.savingEL.slideDown('fast');

		$.ajax({
			type: "POST",
			url: "/event/" + window.App.currentId + "/selectableDates",
			data: {dates: data},
			success: function(){

			},
			dataType: "json"
		}).always(function() {
			that.savingEL.slideUp('fast');
		});

		App.AttendeesView.destroy();

		this.hide();
	},

	oneMonthClicked: function(){
		this.oneMonth(false);
	},

	oneMonthWeekdaysClicked: function(){
		this.oneMonth(true);
	},

	oneMonth: function(weekdays){
		var oneMonth = new Date(moment().add('months', 1));

		this.updateSelected(oneMonth, weekdays);
	},

	twoMonthsClicked: function(){
		this.twoMonths(false);
	},

	twoMonthsWeekdaysClicked: function(){
		this.twoMonths(true);
	},

	twoMonths: function(weekdays){
		var twoMonths = new Date(moment().add('months', 2));

		this.updateSelected(twoMonths, weekdays);
	},

	allClicked: function(){
		this.all(false);
	},

	allWeekdaysClicked: function(){
		this.all(true);
	},

	all: function(weekdays){
		this.updateAll(weekdays);
	},

	clearClicked: function(){
		this.updateAll(false);
	},

	updateAll: function(weekdays){
		_.each(this.collection.models, function(choice){
			if (choice.has('date')){
				var date = choice.get('date');

				if (date >= window.App.today){
					if (!weekdays || (date.getDay() > 0 && date.getDay() < 6)){
						choice.set('selectable', true);
					} else {
						choice.set('selectable', false);
					}
				}
			}
		});
	},

	updateSelected: function(endDate, weekdays){
		_.each(this.collection.models, function(choice){
			if (choice.has('date')){
				var date = choice.get('date');

				if (date >= window.App.today){
					if (date < endDate && (!weekdays || (date.getDay() > 0 && date.getDay() < 6))){
						choice.set('selectable', true);
					} else {
						choice.set('selectable', false);
					}
				}
			}
		});
	}
});
