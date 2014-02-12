window.TopChoicesPanel = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.render();

		this.listenTo(this.model, "change", this.modelChanged);

		this.itemsContainerEl = this.$el.find('.side-info-panel-left-container');
	},

	template: _.template($('#top-choices-template').html()),

	itemTemplate: _.template($('#top-choices-item-template').html()),

	events: {
	},

	render: function(){
		this.$el.html(this.template());

		this.$el.hide();

		$('.event-container').after(this.$el);
	},

	oneModel: null,

	twoModel: null,

	threeModel: null,

	modelChanged: function(){
		var one = this.model.get('one');
		var two = this.model.get('two');
		var three = this.model.get('three');

		if (one === null){
			this.$el.fadeOut('fast');
			return;
		}

		this.$el.fadeIn('fast');

		var currentOneEl = this.itemsContainerEl.find('.top-choice-one');
		var currentTwoEl = this.itemsContainerEl.find('.top-choice-two');
		var currentThreeEl = this.itemsContainerEl.find('.top-choice-three');

		if (one !== null){
			if (one !== this.oneModel){
				if (one === this.twoModel){
					currentTwoEl.addClass('top-choice-one').removeClass('top-choice-two');
				} else if (one === this.threeModel){
					currentThreeEl.addClass('top-choice-one').removeClass('top-choice-three');
				} else {
					this.createItem(one, 'top-choice-one');
				}
			}
		}

		if (two !== null){
			if (two !== this.twoModel){
				if (two === this.oneModel){
					currentOneEl.addClass('top-choice-two').removeClass('top-choice-one');
				} else if (two === this.threeModel){
					currentThreeEl.addClass('top-choice-two').removeClass('top-choice-three');
				} else {
					this.createItem(two, 'top-choice-two');
				}
			}
		}

		if (three !== null){
			if (three !== this.threeModel){
				if (three === this.oneModel){
					currentOneEl.addClass('top-choice-three').removeClass('top-choice-one');
				} else if (three === this.twoModel){
					currentTwoEl.addClass('top-choice-three').removeClass('top-choice-two');
				} else {
					this.createItem(three, 'top-choice-three');
				}
			}
		}

		if (this.oneModel !== one && this.oneModel !== two && this.oneModel !== three){
			this.removeItem(currentOneEl);
		}

		if (this.twoModel !== one && this.twoModel !== two && this.twoModel !== three){
			this.removeItem(currentTwoEl);
		}

		if (this.threeModel !== one && this.threeModel !== two && this.threeModel !== three){
			this.removeItem(currentThreeEl);
		}

		this.oneModel = one;
		this.twoModel = two;
		this.threeModel = three;
	},

	createItem: function(model, className){
		var newItem = $(this.itemTemplate({ date: moment(model.get('date')).format("dddd <br/> Do MMMM")}));

		this.itemsContainerEl.append(newItem);

		_.delay(function(){
					newItem.addClass(className);
				}, 10);
	},

	removeItem: function(element){
		element.addClass('top-choice-hiding');

		_.delay(function(){
			element.remove();
		}, 500);
	}
});
