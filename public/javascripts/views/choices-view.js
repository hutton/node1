window.ChoiceView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.listenTo(this.model, "change", this.modelChanged);
		this.listenTo(this.model, "changedFree", this.freeChanged);
		this.listenTo(this.model, "repositioned", this.adornersRespositioned);
		this.listenTo(this.model, "ensureVisible", this.ensureVisible);
		this.listenTo(this.model, "scrollToTopLine", this.scrollToTopLine);
		this.listenTo(this.model, "repositionSelected", this.repositionSelected);
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
		this.markerItemsEl = this.$el.find(".markers-container span");

		this.freeMarkerEl = this.$el.find('.free-marker');

		this.dateCellContainerEl = this.$el.find('.date-cell-container');

		this.updateFree(false);

		this.updateSelectable(this.model.get('selectable'));

		this.updateSelected(this.model.get('selected'), false);

		return this;
	},

	modelChanged: function(){
		console.log("Choices - model changed");

		var changed = this.model.changedAttributes();

		if (!_.isUndefined(changed['selected'])){
			this.updateSelected(changed['selected'], true);
		}

		if (!_.isUndefined(changed['selectable'])){
			this.updateSelectable(changed['selectable']);
		}
	},

	freeChanged: function(){
		console.log("Choices - free changed");

		this.updateFree(true);
	},

	isSelected: false,

	updateFree: function(animate){
		if (this.model.isFree() || this.model.pretendFree){
			this.freeMarkerEl.addClass('free');
		} else {
			this.freeMarkerEl.removeClass('free');
		}

		var availList = this.model.getAttendeeAvailability();

		this.markerItemsEl.each(function(index, element){
			if (availList[index]){
				var marker = $(this);

				if (!marker.hasClass("a")){
					marker.addClass("a");

					if (animate){
						marker.velocity({top: -6}, 120, 'easeOutCubic').velocity({top: 0}, 600, 'easeOutBounce');
					}
				}
			} else {
				$(this).removeClass("a");
			}
		});
	},

	repositionSelected: function(){
		this.updateSelected(this.model.get('selected'), false);
	},

	updateSelected: function(selected, animate){
		if (selected){
			if (!this.isSelected){
				this.ensureVisible();
			}

			this.isSelected = true;

			var position = this.$el.position();

			var duration = 0;

			if (animate){
				duration = 200;
			}

			// App.ChoicesView.selectedMarkerEl.stop();
			// App.ChoicesView.selectedMarkerEl.velocity({left: position.left, top: position.top}, duration);

			App.ChoicesView.selectedMarkerEl.css({left: position.left, top: position.top});
		} else {
			this.isSelected = false;
		}
	},

	updateSelectable: function(selectable){
		if (selectable){
			this.$el.removeClass('unselectable');
			this.dateCellContainerEl.append(this.markersContainerEl);
			this.markersContainerEl.before(this.freeMarkerEl);
		} else {
			this.$el.addClass('unselectable');
			this.markersContainerEl.detach();
			this.freeMarkerEl.detach();
		}
	},

	isVisible: function(){
		var height = $(window).height();
		var scrollPos = $(window).scrollTop();

		var navBarHeight = $('.navbar-fixed-top').height() + $('.days-table').height();

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
		var navBarHeight = $('.navbar-fixed-top').height() + $('.days-table').height();
		var offset = this.$el.offset();
		var itemHeight = $('.date-cell').first().height();

		this.$el.velocity("scroll", {duration: 400, offset: -(navBarHeight + itemHeight)});
	},

	adornersRespositioned: function(){
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

	el: $(".scrollable"),

	selectedMarkerEl: $(".calendar-selected-item"),
	
	tableEl: $(".event-container-margin .event-table"),

	monthTitleTemplate: _.template($('#month-title-template').html()),

	today: new Date(),

	currentScroll: null,

	lastSelectableRow: null,

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

	showing: false,

	show: function(){
		this.$el.show();

		this.$el.removeClass('scrollable-hidden');

		this.showing = true;

		$(".days-table-container").show();
		this.resize();
	},

	hide: function(){
		var that = this;

		$(".days-table-container").hide();
		
		this.$el.addClass('scrollable-hidden');

		_.delay(function(){
			that.$el.hide();
		}, 400);

		this.showing = false;
	},

	updateLastSelectableRow: function(){
		var that = this;

		this.lastSelectableRow = null;

		this.tableEl.find('tr').each(function(index, rowEl){
			rowEl  = $(rowEl);

			if (rowEl.find('.markers-container').length > 0){
				that.lastSelectableRow = rowEl;
			}
		});

		if (this.lastSelectableRow === null){
			this.lastSelectableRow = this.tableEl.find('tr').last();
		}
	},

	resize: function(){
		if (!this.showing){
			return;
		}

		var windowHeight = $(window).height();

		if (windowHeight > 350){
			$(".days-table-container").show();
			this.$el.show();

			var size = $(".date-cell-container").first().width();
			var windowSize = Math.min($("body").first().width(), 600);
			
			var parent = this.tableEl.parent();
			 
			this.tableEl.detach();
			 
			height = Math.min(size, 120);

			this.tableEl.find("tr > td > .date-cell-container").height(height);
			this.tableEl.find("tr > td > .month").height(height);

			parent.append(this.tableEl);

			// var topChoiceSize = size - 2;

	        this.$el.find(".calendar-selected-item").width(size).height(height);

	        if (App.selectedModel !== null){
	            App.selectedModel.trigger('repositionSelected');
	        }

			App.realignAdorners();
		} else {
			$(".days-table-container").hide();

			this.$el.hide();
		}
	},

	insertMonthTitle: function(rowItemCount, row, month){
		var originalRowItemCount = rowItemCount;

		var showTitleAt = 0;
		var first = true;

		var itemsInserted = 0;

		if (rowItemCount > 1){
			showTitleAt = 7 - rowItemCount;
		}

		while (itemsInserted < 7){
			var newItem = $(this.monthTitleTemplate({month: month, showTitle: itemsInserted == showTitleAt}));

			if (moment().format("MMMM") == month){
				newItem.addClass("this-month");
			}

			row.append(newItem);
			itemsInserted++;

			if (itemsInserted == 7 - rowItemCount){
				this.tableEl.append($("<tr></tr>"));

				row = this.tableEl.find("tr:last");
			}
		}

		return row;
	},

	insertMonthTitle2: function(rowItemCount, row, month){
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
	},

	detachedRows: [],

	setSelectableDateMode: function(selectableDateModeOn){
		var that = this;

		if (selectableDateModeOn){
			_.each(this.detachedRows, function(row){
				that.tableEl.append(row);
			});

			this.resize();
		} else {
			this.updateLastSelectableRow();

			var currentRow = this.lastSelectableRow.next();

			var skipRows = 7;
			while (currentRow.length > 0 && skipRows-- > 0){
				currentRow = currentRow.next();
			}

			this.detachedRows = [];

			while (currentRow.length > 0){
				var prev = currentRow;

				currentRow = currentRow.next();

				this.detachedRows.push(prev);
				prev.detach();
			}
		}
	}
});
