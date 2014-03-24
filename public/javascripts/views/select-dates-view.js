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
	},

	hide: function(){
		window.App.selectableDateMode = false;

		this.$el.slideUp('fast');
	},

	cancel: function(){
		
		window.location = window.location;
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

	oneMonthClicked: function(){
		var oneMonth = new Date(moment().add('months', 1));

		this.updateSelected(oneMonth);
	},

	twoMonthsClicked: function(){
		var oneMonth = new Date(moment().add('months', 2));

		this.updateSelected(oneMonth);
	},

	allClicked: function(){
		_.each(this.collection.models, function(choice){
			if (choice.has('date')){
				var date = choice.get('date');

				if (date > window.App.today){
					choice.set('selectable', true);
				}
			}
		});
	},

	updateSelected: function(endDate){
		_.each(this.collection.models, function(choice){
			if (choice.has('date')){
				var date = choice.get('date');

				if (date > window.App.today){
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
