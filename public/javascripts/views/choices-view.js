window.ChoiceView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.listenTo(this.model, "change", this.modelChanged);
	},

	template: _.template($('#choice-template').html()),

	firstChoiceTemplate: _.template($('#first-choice-template').html()),

	events: {
		"click":	"dayClicked"
	},

	className: "date-cell",

	render: function(){
		this.$el.html(this.template(this.model.attributes));

		this.$el.hover(this.mouseEnter, this.mouseLeave);		

		this.updateView(false);

		return this;
	},

	modelChanged: function(){
		this.updateView(true);
	},

	updateView: function(animate){
		var target = $(this.$el).find("div:first");

		if (this.model.has("free")){
			var freeDates = this.model.get("free");

			var targetbackground = this.calcBackground(window.App.attendees.length, freeDates.length);

			this.$el.attr("style", "background-color: " + targetbackground + ";");
		} else {
			var targetbackground = this.calcBackground(window.App.attendees.length, 0);

			this.$el.attr("style", "background: " + targetbackground + ";");
		}

		if (this.model.isFree()){
			this.$el.find('.free-marker').show();
		} else {
			this.$el.find('.free-marker').hide();
		}

		if (false /*this.model.has("top-choice")*/){
			if (this.$el.find('.top-choice-text').length === 0){
				if (this.model.get("top-choice") > 0){
					this.$el.find('.date-cell-container').append(this.firstChoiceTemplate({choice: this.model.get("top-choice")}));
				}
			} else {
				if (this.model.get("top-choice") > 0){
					this.$el.find('.top-choice-text').html(this.model.get("top-choice"));
				} else {
					this.$el.find('.top-choice-text').remove();
				}
			}
		}
	},

	dayClicked: function(event){
		var target = $(this.$el).find("div:first");

		if (target.hasClass('selected')){
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

	calcBackground: function(total, count){
		var emptyColor = 250;
		var fullColor = 215;

		var diff = emptyColor - fullColor;

		var target = emptyColor - ((count / total) * diff);

		target = Math.round(target);

		var targetHex = target.toString(16);

		return "#" + targetHex + targetHex + targetHex;

	},

	mouseEnter: function(){
		App.SideInfoPanel.updateModel(this.model);
	},

	mouseLeave: function(){
		App.SideInfoPanel.updateModel(null);
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

	el: $(".event-table"),

	monthTitleTemplate: _.template($('#month-title-template').html()),

	today: new Date(),

	render: function(){
		var that = this;

		$(this.el).empty();

		var row = null;
		var todayAdded = false;
		var inPast = true;

		_(this._choiceViews).each(function(choice) {
			var date = choice.model.get("date");

			if (date.getDay() == 1){
				that.$el.append($("<tr></tr>"));

				row = that.$el.find("tr:last");

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
					choice.$el.find("div:first").addClass("past");
				}
			}
		});

		this.$el.append($("<tr class='selected-row'><td colspan='7' width='7'></td></tr>"));

		if (this.$el.find(".today").length > 0){
			this.$el.find(".today")[0].scrollIntoView(true);
		}

		var body = $("body");

		body.scrollTop(body.scrollTop() - 112);

		return this;
	},

	insertMonthTitle: function(rowItemCount, row, month){
		var originalRowItemCount = rowItemCount;

		var showTitleAt = 0;
		var first = true;

		var itemsInserted = 0;

		if (rowItemCount > 3){
			showTitleAt = 7 - rowItemCount;
		}

		while (itemsInserted < 7){
			var newItem = $(this.monthTitleTemplate({month: month, showTitle: itemsInserted == showTitleAt}));

			if (first){
				newItem.removeClass("first-seven").addClass("first");
				first = false;
			}

			if (moment().format("MMMM") == month){
				newItem.addClass("this-month");
			}

			row.append(newItem);
			itemsInserted++;

			if (itemsInserted == 7 - rowItemCount){
				this.$el.append($("<tr></tr>"));

				row = this.$el.find("tr:last");
			}
		}

		return row;
	}
});
