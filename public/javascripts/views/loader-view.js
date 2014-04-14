window.LoaderView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();
	},

	el: $(".loader"),

	events: {
		"click": "close"
	},

	render: function(){
		this.inner = this.$el.find('.loader-inner');
	},

	show: function(){
		var that = this;

		this.$el.show();

		_.delay(function(){
			that.$el.removeClass('loader-hide');	
		}, 10);
	},

	close: function(){
		var that = this;

		this.$el.addClass('loader-hide');

		_.delay(function(){
			that.$el.hide();
		}, 400);
	}
});
