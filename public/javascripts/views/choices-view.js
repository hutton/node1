window.ChoiceView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.listenTo(this.model, "change", this.modelChanged);
		this.listenTo(this.model, "changedFree", this.freeChanged);
		this.listenTo(this.model, "repositioned", this.adornersRespositioned);
		this.listenTo(this.model, "ensureVisible", this.ensureVisible);
		this.listenTo(this.model, "scrollToTopLine", this.scrollToTopLine);
	},

	template: _.template($('#choice-template').html()),

	events: {
		"click":		"dayClicked",
		"touchstart": 	"touchStart"
	},

	className: "date-cell",

	render: function(){
		var choices = [];

		if (this.model.has('choices')){
			choices = this.model.get('choices');
		}

		this.$el.html(this.template({ date: this.model.get('date'), availList: this.model.getAttendeeAvailability(), selectable: this.model.isSelectable() } ));

		if (this.model.get("past")){
			this.$el.addClass("past");
		}

		this.markersContainerEl = this.$el.find('.markers-container');
		this.markerItemsEl = this.$el.find(".markers-container li");

		this.updateFree(false);

		this.updateSelectable(this.model.get('selectable'));

		this.updateTopChoices(false);

		return this;
	},

	modelChanged: function(){
		console.log("Choices - model changed");

		var changed = this.model.changedAttributes();

		if (!_.isUndefined(changed['selected'])){
			this.updateSelected(changed['selected']);
		}

		if (!_.isUndefined(changed['selectable'])){
			this.updateSelectable(changed['selectable']);
		}
	},

	freeChanged: function(){
		console.log("Choices - free changed");

		this.updateFree(true);

		this.updateTopChoices(true);
	},

	isSelected: false,

	updateFree: function(animate){
		var target = this.$el.find(".date-cell-container");

		if (this.model.isFree() || this.model.pretendFree){
			this.$el.find('.free-marker').addClass('free');
		} else {
			this.$el.find('.free-marker').removeClass('free');
		}

		var availList = this.model.getAttendeeAvailability();

		this.markerItemsEl.each(function(index, element){
			if (availList[index]){
				$(this).addClass("a");
			} else {
				$(this).removeClass("a");
			}
		});
	},

	updateSelected: function(selected){
		if (selected){
			if (!this.isSelected){
				this.ensureVisible();
			}

			this.isSelected = true;

			this.$el.addClass('cell-selected');
		} else {
			this.$el.removeClass('cell-selected');

			this.isSelected = false;
		}
	},

	updateSelectable: function(selectable){
		if (selectable){
			this.$el.removeClass('unselectable');
			this.$el.find('.date-cell-container').append(this.markersContainerEl);

			//this.$el.find('.markers-container').show();
;
		} else {
			this.$el.addClass('unselectable');
			this.markersContainerEl.detach();
			//this.$e;
			//this.$el.find('.markers-container').hide();
		}
	},

	isVisible: function(){
		var height = $(window).height();
		var scrollPos = $(window).scrollTop();

		var navBarHeight = $('.navbar-fixed-top').height();

		var visTop = scrollPos + navBarHeight;
		var visBottom = scrollPos + (height - $('.day-view-container').height());

		var offset = this.$el.offset();

		return (offset.top >= visTop && (offset.top + this.$el.height() <= visBottom));
	},

	ensureVisible: function(){
		if (!this.isVisible()){
			this.scrollToTopLine();
		}
	},

	scrollToTopLine: function(){
		var navBarHeight = $('.navbar-fixed-top').height();
		var offset = this.$el.offset();
		var itemHeight = $('.date-cell').first().height();

		$('html, body').stop();

		$('html, body').animate({
			scrollTop: offset.top - (navBarHeight + itemHeight)
		}, 400);
	},

	adornersRespositioned: function(){
		this.updateTopChoices(false);
	},

	updateTopChoices: function(animate){
		return;
		
		if (this.model.has('top-choice')){
			var place = this.model.get('top-choice');

			var classSuffix;

			if (place === 1){
				classSuffix = "one";
			} else if (place === 2){
				classSuffix = "two";
			} else if (place === 3){
				classSuffix = "three";
			}

			var position = this.$el.position();

			if (animate){
				$(".calendar-choices-top-" + classSuffix).animate({left: position.left, top: position.top}, 400);
			} else {
				$(".calendar-choices-top-" + classSuffix).animate({left: position.left, top: position.top}, 0);
			}
		}
	},

	touchStarted: false,

	touchStart: function(event){
		var that = this;

		this.touchStarted = true;

		_.delay(function(){
			that.touchStarted = false;
		}, 500);
	},

	dayClicked: function(event){
		var target = $(this.$el).find("div:first");

		if (App.selectableDateMode){
			App.SelectDatesView.clearGroupSelected();

			if (this.model.isSelectable()){
				this.model.set({'selectable': false});
			} else {
				this.model.set({'selectable': true});
			}

		} else {
			if (this.model.isSelectable()){
				this.isSelected = true;

				if (this.model.get('selected')){
					this.model.toggleFree();
				} else {
					App.setSelected(this.model);
				}

				App.AttendeesView.show();
			}
		}
	}
});

window.ChoicesView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		var that = this;
	
		this._choiceViews = [];
	 
		this.collection.each(function(choice) {
			that._choiceViews.push(new ChoiceView({
			model : choice,
			tagName : 'td'
			}));
		});
	},

	el: $(".event-container-margin"),
	
	tableEl: $(".event-container-margin .event-table"),

	monthTitleTemplate: _.template($('#month-title-template').html()),

	today: new Date(),

	currentScroll: null,

	isActive: true,

	active: function(isActive){
	},

	render: function(){
		var that = this;

		var row = null;
		var todayAdded = false;

		_(this._choiceViews).each(function(choice) {
			var date = choice.model.get("date");

			if (date.getDay() == 1){
				that.tableEl.append($("<tr></tr>"));

				row = that.tableEl.find("tr:last");

				rowItemCount = 0;
			}

			if (row !== null){
				if (date.getDate() == 1){

					row = that.insertMonthTitle(rowItemCount, row, moment(date).format("MMMM"));
				}

				row.append(choice.render().el);
				rowItemCount++;
			}

			if (!todayAdded && sameDay(that.today, date)){
				choice.$el.addClass('today');

				todayAdded = true;
			}
		});

		this.tableEl.append($("<tr class='selected-row'><td colspan='7' width='7'></td></tr>"));

		if (this.tableEl.find(".today").length > 0){
			this.tableEl.find(".today")[0].scrollIntoView(true);
		}

		return this;
	},

	resize: function(){
		if (this.isActive){
			var size = $(".event-table .date-cell").first().width();
			var windowSize = Math.min($("body").first().width(), 600);
			
			var parent = this.tableEl.parent();
			 
			this.tableEl.detach();
			 
			this.tableEl.find("tr > td > .date-cell-container").height(size - 6);
			this.tableEl.find("tr > td > .month").height(size - 6);

			this.tableEl.find(".info-row-names").width(windowSize - 132);
			 
			parent.append(this.tableEl);

			var topChoiceSize = size - 2;

			this.$el.find(".calendar-choices-top").width(topChoiceSize).height(topChoiceSize);

			App.realignAdorners();
		}
	},

	insertMonthTitle: function(rowItemCount, row, month){
		var originalRowItemCount = rowItemCount;

		var showTitleAt = 0;
		var first = true;

		var itemsInserted = 0;

		showTitleAt = 7 - rowItemCount;

		while (itemsInserted < 14){
			var newItem = $(this.monthTitleTemplate({month: month, showTitle: itemsInserted == showTitleAt}));

			if (moment().format("MMMM") == month){
				newItem.addClass("this-month");
			}

			row.append(newItem);
			itemsInserted++;

			if (itemsInserted == 7 - rowItemCount || itemsInserted == 14 - rowItemCount){
				this.tableEl.append($("<tr></tr>"));

				row = this.tableEl.find("tr:last");
			}
		}

		return row;
	}
});
