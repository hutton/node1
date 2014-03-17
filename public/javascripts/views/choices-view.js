window.ChoiceView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.listenTo(this.model, "change", this.modelChanged);
		this.listenTo(this.model, "repositioned", this.adornersRespositioned);
	},

	template: _.template($('#choice-template').html()),

	firstChoiceTemplate: _.template($('#first-choice-template').html()),

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

		this.$el.html(this.template({ date: this.model.get('date'), availList: this.model.getAttendeeAvailability(), selectable: this.model.get('selectable') } ));

		this.$el.hover(this.mouseEnter, this.mouseLeave);		

		this.updateView(false);

		this.updateTopChoices(false);

		return this;
	},

	modelChanged: function(){
		this.updateView(true);

		this.updateTopChoices(true);
	},

	updateView: function(animate){
		var target = this.$el.find(".date-cell-container");

		// target.css("background-color", this.model.calcBackground());
		// target.css("border-color", this.model.calcBorder());
		// target.find("div.date-text").css("opacity", this.model.calcForegroundOpacity());

		if (this.model.isFree() || this.model.pretendFree){
			this.$el.find('.free-marker').addClass('free');
		} else {
			this.$el.find('.free-marker').removeClass('free');
		}

		var availList = this.model.getAttendeeAvailability();

		this.$el.find(".markers-container li").each(function(index, element){
			if (availList[index]){
				$(this).addClass("a");
			} else {
				$(this).removeClass("a");
			}
		});

	},

	adornersRespositioned: function(){
		this.updateTopChoices(false);
	},

	updateTopChoices: function(animate){
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

		if (target.hasClass('selected') || $('.side-info-panel').is(':visible')){
			this.model.toggleFree();
		} else {
			$(".selected").removeClass('selected');
			$(".cell-selected").removeClass('cell-selected');

			var selectedRow = target.parents("tr");

			App.updateSelectedItem(this.model, selectedRow);

			this.$el.addClass('cell-selected');
			target.addClass('selected');
		}
	},

	calcDegrees: function(total, count){
		return Math.round((count / total) * 36) * 10;
	},

	mouseEnter: function(){
		if (App.SideInfoPanel !== null && !this.touchStarted){
			App.SideInfoPanel.updateModel(this.model);
		}
	},

	mouseLeave: function(){
		if (App.SideInfoPanel !== null && !this.touchStarted){
			App.SideInfoPanel.updateModel(null);
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

		this.isActive = isActive;

		if (isActive){
			$('body').append(this.$el);

			if (!window.App.showInfo){
				$('.days-table').show();
			}

			if (this.currentScroll !== null){
				$('body').scrollTop(this.currentScroll);
			}

		} else {
			this.currentScroll = $('body').scrollTop();
			this.$el.detach();
		}
	},

	render: function(){
		var that = this;

		var row = null;
		var todayAdded = false;
		var inPast = true;

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

			if (inPast){
				if (that.today < date || sameDay(that.today, date)){
					inPast = false;
				} else {
					choice.$el.addClass("past");
				}
			}

			if (!choice.model.get('selectable')){
				choice.$el.addClass("unselectable");
			}
		});

		this.tableEl.append($("<tr class='selected-row'><td colspan='7' width='7'></td></tr>"));

		if (this.tableEl.find(".today").length > 0){
			this.tableEl.find(".today")[0].scrollIntoView(true);
		}

		var body = $("body");

		body.scrollTop(body.scrollTop() - 112);

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
