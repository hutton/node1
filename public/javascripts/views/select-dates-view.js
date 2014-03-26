window.SelectDatesView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},

	el: $(".selecting-dates-container"),

	events: {
		"click #selecting-dates-cancel":	"cancel",
		"click #selecting-dates-save":		"save",
		"click #selecting-dates-one-month": "oneMonthClicked",
		"click #selecting-dates-two-months":	"twoMonthsClicked",
		"click #selecting-dates-all":		"allClicked",
	},

	render: function(){
		this.$el.html(this.template());

		this.$el.hide();

		$('.event-container').after(this.$el);
	},

	show: function(){
		window.App.selectableDateMode = true;

		this.$el.slideDown('fast');

		this.originalSelectableChoices = this.collection.where({selectable: true});	
	},

	hide: function(){
		window.App.selectableDateMode = false;

		this.$el.slideUp('fast');

		this.clearGroupSelected();
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
		var selectableChoices = this.collection.where({selectable: true});

		var selectableDates = _.map(selectableChoices, function(choice){
			return choice.get('date');
		});

		var data = JSON.stringify(selectableDates);

		$.ajax({
			type: "POST",
			url: "/event/" + window.App.currentId + "/selectableDates",
			data: {dates: data},
			success: function(){

			},
			dataType: "json"
		});

		this.hide();
	},

	clearGroupSelected: function(){
		this.oneMonthSelected = false;
		this.twoMonthsSelected = false;
		this.allSelected = false;

		this.$el.find('span').removeClass('selected');
	},

	oneMonthSelected: false,
	twoMonthsSelected: false,
	allSelected: false,

	oneMonthClicked: function(){
		var el = this.$el.find('#selecting-dates-one-month');

		if (this.oneMonthSelected){
			this.updateAll(false);

			el.removeClass('selected');
		} else {
			this.clearGroupSelected();

			var oneMonth = new Date(moment().add('months', 1));

			this.updateSelected(oneMonth);

			el.addClass('selected');
		}

		this.oneMonthSelected = !this.oneMonthSelected;
	},

	twoMonthsClicked: function(){
		var el = this.$el.find('#selecting-dates-two-months');

		if (this.twoMonthsSelected){
			this.updateAll(false);

			el.removeClass('selected');
		} else {
			this.clearGroupSelected();

			var twoMonths = new Date(moment().add('months', 2));

			this.updateSelected(twoMonths);

			el.addClass('selected');
		}

		this.twoMonthsSelected = !this.twoMonthsSelected;
	},

	allClicked: function(){
		var el = this.$el.find('#selecting-dates-all');

		if (this.allSelected){
			this.updateAll(false);

			el.removeClass('selected');
		} else {
			this.clearGroupSelected();

			this.updateAll(true);

			el.addClass('selected');
		}

		this.allSelected = !this.allSelected;
	},

	updateAll: function(selected){
		_.each(this.collection.models, function(choice){
			if (choice.has('date')){
				var date = choice.get('date');

				if (date >= window.App.today){
					choice.set('selectable', selected);
				}
			}
		});
	},

	updateSelected: function(endDate){
		_.each(this.collection.models, function(choice){
			if (choice.has('date')){
				var date = choice.get('date');

				if (date >= window.App.today){
					if (date < endDate){
						choice.set('selectable', true);
					} else {
						choice.set('selectable', false);
					}
				}
			}
		});
	}
});
