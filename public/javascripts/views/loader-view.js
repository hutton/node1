window.LoaderView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},

	template: _.template($('#loader-template').html()),

	el: $(".loader"),

	events: {
		"click": "close"
	},

	render: function(){
		this.inner = this.$el.find('.loader-inner');

		this.inner.find('div').remove();

		var content = this.template({title: this.calendarModel.get('name')});

		this.inner.append(content);

		this.inner.find('> div').hide();
	},

	show: function(){
		var that = this;

		this.$el.show();

		this.$el.find('.loader-convenely').hide();

		this.render();

		that.$el.removeClass('loader-hide');	

		this.startAnimations();
	},

	close: function(){
		var that = this;

		this.$el.addClass('loader-hide');

		_.delay(function(){
			that.$el.hide();
			that.inner.find('div').remove();
		}, 400);
	},

	animateDelay: 2000,

	startAnimations: function(){
		var choicesSelected = 5;
		var yourChoices = 0;

		this.animateFromEdge(this.$el.find('.loader-title'), 'top');

		this.currentAnimateDelay = this.animateDelay;

		if (!this.calendarModel.get('datesSelected')){
			this.animateFromEdge(this.$el.find('.loader-select-dates'), 'bottom');
		} else{
			if (this.attendees.length < 3 || choicesSelected < 3){
				this.animateFromEdge(this.$el.find('.loader-between'), 'bottom');
			} else {
				this.animateFromEdge(this.$el.find('.loader-top-choice'), 'bottom');
				this.animateFromEdge(this.$el.find('.loader-top-other'), 'bottom');
			}

			if (yourChoices == 0 || App.newMode){
				this.animateFromEdge(this.$el.find('.loader-set-choices'), 'bottom');
			} else {
				if (this.attendees.length < 3){
					this.animateFromEdge(this.$el.find('.loader-invite'), 'bottom');
				}
			}
		}
	},

	animateFromEdge: function(element, edge){	
		element.attr({'style': 'opacity: 0.0'});
		element.show();

		var that = this;

		_.delay(function(){
			var height = $(window).height();
			var offset = element.position();

			var startPos = height - offset.top;

			if (edge === 'top'){
				startPos = -offset.top;
			}

			element.removeClass('loader-animate');

			element.attr({'style': 'transform: translateY(' + startPos + 'px); -webkit-transform: translateY(' + startPos + 'px); opacity: 1.0'});

			_.delay(function(){
				element.addClass('loader-animate');
				element.attr({'style': 'transform: translateY(0px); -webkit-transform: translateY(0px); opacity: 1.0'});
			}, 50);
		}, that.currentAnimateDelay);

		this.currentAnimateDelay += this.animateDelay;
	}
});
