window.InfoPanel = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},

	el: $("body"),

	events: {
		"click #show-info":				"infoClicked",
		"click .event-table td > div":	"dayClicked"
	},

	initialise: function(){
		_.bindAll(this);
	},

	infoClicked: function(){
		this.$el.find(".info").slideToggle("fast");
	},

	dayClicked: function(event){
		var target = $(event.currentTarget);

		if (target.hasClass('selected')){
			target.find('div:nth-of-type(2)').toggleClass('free');
			target.find('div:nth-of-type(2)').toggleClass('unknown');
		} else {
			$(".selected").removeClass('selected');

			target.addClass('selected');
		}
	}
});
