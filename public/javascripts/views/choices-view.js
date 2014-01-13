window.ChoiceView = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.listenTo(this.model, "change", this.modelChanged);
	},

	template: _.template($('#choice-template').html()),

	firstChoiceTemplate: _.template($('#first-choice-template').html()),

	events: {
		"click div:first":	"dayClicked"
	},

	pie: null,

	className: "date-cell",

	render: function(){
		this.$el.html(this.template(this.model.attributes));

		this.pie = this.$el.find(".pie");

		this.updateView(false);

		return this;
	},

	modelChanged: function(){
		this.updateView(true);
	},

	updateView: function(animate){
		var target = $(this.$el).find("div:first");

		if (target.hasClass('selected')){
			target.find('div:nth-of-type(2)').toggleClass('free');
			target.find('div:nth-of-type(2)').toggleClass('unknown');
		}

		if (this.model.has("free")){
			var freeDates = this.model.get("free");

			this.targetDeg = this.calcDegrees(window.App.attendees.length, freeDates.length);

			if (animate){
				this.animatePie();
			} else {
				this.pie.attr("data-value", this.targetDeg);

				if (this.targetDeg >= 180){
					this.pie.addClass("big");
				} else {
					this.pie.removeClass("big");
				}
			}

			if (this.model.isFree() || this.model.pretendFree){
				this.$el.find(".unknown").addClass("free").removeClass("unknown");
			}
		}

		if (this.model.has("top-choice")){
			if (this.model.get("top-choice") > 0){
				this.$el.find('.date-cell-container').append(this.firstChoiceTemplate({choice: this.model.get("top-choice")}));
			} else {
				
			}
		}
	},

	animatePie: function(){
		var current = parseInt(this.pie.attr("data-value"));
		var change = 0;

		if (current < this.targetDeg){
			change = 10;
		}

		if (current > this.targetDeg){
			change = -10;
		}

		if (change !== 0){
			this.pie.attr("data-value", current + change);

			if (current + change >= 180){
				this.pie.addClass("big");
			} else {
				this.pie.removeClass("big");
			}

			_.delay(this.animatePie, 10);
		}
	},

	dayClicked: function(event){
		var target = $(this.$el).find("div:first");

		if (target.hasClass('selected')){
			this.model.toggleFree();
		} else {
			var selectedRow = target.parents("tr");

			$(".selected").find(".selected-pointer").remove();

			$(".selected").removeClass('selected');

			App.updateSelectedItem(this.model, selectedRow);

			target.addClass('selected');

			target.append("<div class='selected-pointer'></div>");
		}
	},

	calcDegrees: function(total, count){
		return Math.round((count / total) * 36) * 10;
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
				choice.$el.find("div").first().append("<div class='today'></div>");

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
