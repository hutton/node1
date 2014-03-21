window.SelectDatesView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},

	el: $(".selecting-dates-container"),

	events: {
		"click #selecting-dates-cancel": 	"hide",
		"click #selecting-dates-save": 		"save"
	},

	render: function(){
		this.$el.html(this.template());

		this.$el.hide();

		$('.event-container').after(this.$el);
	},

	show: function(){
		window.App.selectableDateMode = true;

		this.$el.show();

		$('.days-table').hide();
	},

	hide: function(){
		window.App.selectableDateMode = false;

		this.$el.hide();

		$('.days-table').show();
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
	}
});
