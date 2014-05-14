window.LoaderView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},

	template: _.template($('#loader-template').html()),

	el: $(".loader"),

	events: {
		"click": "close"
	},

	autoClose: true,

	render: function(){
		this.inner = this.$el.find('.loader-inner');

		this.inner.find('div').remove();

		var selectable = this.choices.firstAndLastDates();

		var topDate = null;
		if (this.topChoicesModel.get('one') !== null){
			topDate = this.topChoicesModel.get('one').get('date');
		}

		var secondDate = null;
		if (this.topChoicesModel.get('two') !== null){
			secondDate = this.topChoicesModel.get('two').get('date');
		}

		var thirdDate = null;
		if (this.topChoicesModel.get('three') !== null){
			thirdDate = this.topChoicesModel.get('three').get('date');
		}

		var content = this.template({
			title: this.calendarModel.get('name'),
			firstSelectable: moment(selectable.first),
			lastSelectable: moment(selectable.last),
			topDate: moment(topDate),
			secondDate: moment(secondDate),
			thirdDate: moment(thirdDate)
		});

		this.inner.append(content);

		this.inner.find('> div').hide();
	},

	show: function(){
		var that = this;

		this.$el.show();

		this.$el.find('.loader-convenely').hide();

		this.render();

		this.inner.css({'margin-top': 0});

		that.$el.removeClass('loader-hide');	

		this.startAnimations();
	},

	close: function(){
		var that = this;

		this.canceled = true;

		this.inner.css({'margin-top': -this.inner.height()});

		this.$el.addClass('loader-hide');

		_.delay(function(){
			that.$el.hide();
			that.inner.find('div').remove();
		}, 400);
	},

	animateDelay: 1000,

	canceled: false,

	startAnimations: function(){
		var that = this;
		var choicesSelected = this.choices.totalChoices();
		var yourChoices = this.choices.choicesForAttendee(App.currentAttendeeId);

		this.currentAnimateDelay = 400;

		this.showClose();
		this.setCloseText("Skip");

		this.$el.find('.loader-title').show();
		//this.animateFromEdge(this.$el.find('.loader-title'), 'top');

		if (!this.calendarModel.get('datesSelected') || this.choices.totalSelectable() === 0){
			this.animateFromEdge(this.$el.find('.loader-select-dates'), 'bottom');

			this.setCloseText("Continue");
		} else{
			if (this.choices.totalSelectable() === 1){
				this.animateFromEdge(this.$el.find('.loader-on'), 'bottom');
			} else if (!this.topChoicesModel.has('one') || !this.topChoicesModel.has('two') || !this.topChoicesModel.has('three')){
				this.animateFromEdge(this.$el.find('.loader-between'), 'bottom');
			} else {
				this.animateFromEdge(this.$el.find('.loader-top-choice'), 'bottom');
				this.animateFromEdge(this.$el.find('.loader-top-other'), 'bottom');
			}

			if (yourChoices === 0 || App.newMode){
				this.animateFromEdge(this.$el.find('.loader-set-choices'), 'bottom');
				this.setCloseText("Continue");
			} else {
				if (this.attendees.length < 3){
					this.animateFromEdge(this.$el.find('.loader-invite'), 'bottom');
				}
			}
		}

		if (this.autoClose){
			_.delay(function(){
				if (!that.canceled){
					that.close();
				}

			}, this.currentAnimateDelay + 1500);
		}
	},

	setCloseText: function(text){
		var that = this;

		_.delay(function(){
			that.$el.find('.loader-close').html(text + " <i class='fa fa-chevron-right'></i>");
		}, this.currentAnimateDelay - this.animateDelay);
	},

	hideClose: function(){
		var that = this;

		_.delay(function(){
			that.$el.find('.loader-close').addClass('loader-close-hidden');
		}, this.currentAnimateDelay - this.animateDelay);
	},

	showClose: function(){
		var that = this;

		_.delay(function(){
			that.$el.find('.loader-close').removeClass('loader-close-hidden');
		}, this.currentAnimateDelay - this.animateDelay);
	},

	animateFromEdge: function(element, edge){
		element.attr({'style': 'opacity: 0.0'});
		element.show();

		var that = this;

		_.delay(function(){
			var height = $(window).height();
			var offset = element.position();

			var startPos = 60;

			if (edge === 'top'){
				startPos = -offset.top;
			}

			element.removeClass('loader-animate');

			element.attr({'style': 'transform: translateY(' + startPos + 'px); -webkit-transform: translateY(' + startPos + 'px); opacity: 0.0'});

			_.delay(function(){
				element.addClass('loader-animate');
				element.attr({'style': 'transform: translateY(0px); -webkit-transform: translateY(0px); opacity: 1.0'});
			}, 50);
		}, that.currentAnimateDelay);

		this.currentAnimateDelay += this.animateDelay;
	}
});
