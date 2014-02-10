window.SideInfoPanel = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.$el.html(this.template({attendees: App.attendees.models}));

		$('.event-container').after(this.$el);

		this.sideInfoPanel = this.$el.find('.side-info-panel');

		this.sideInfoAttendees = this.$el.find('li');

		this.sideInfoList = this.$el.find('ul');

		this.sideInfoInvite = this.$el.find('.side-info-invite');

		this.sideInfoContainer = this.$el.find('.side-info-panel-container');

		if (App.attendees.length <= 1){
			this.sideInfoList.hide();
			this.sideInfoInvite.show();
		} else {
			this.sideInfoList.show();
			this.sideInfoInvite.hide();

			this.$el.hide();
		}
	},

	template: _.template($('#side-info-panel-template').html()),

	events: {
	},

	updateInPlace: function(dateGreater){
		var that = this;

		if (this.model === null && App.attendees.length > 1){
			_.delay(function(){
				this.$el.hide();
			}, 100);
		} else {
			if (this.model !== null){
				if (App.attendees.length > 1){
					var oldDatePanel = this.sideInfoPanel.find('.side-info-date').first();

					var inClass = 'side-info-date-greater';
					var outClass = 'side-info-date-less';

					if (dateGreater){
						inClass = 'side-info-date-less';
						outClass = 'side-info-date-greater';
					}

					this.sideInfoPanel.prepend('<div class="side-info-date ' + inClass + '">' + moment(this.model.get('date')).format("dddd <br/> Do MMMM") + '</div>');
					_.delay(function(){
						that.sideInfoPanel.find('.side-info-date').first().removeClass(inClass);
					}, 20);

					oldDatePanel.addClass(outClass);

					_.delay(function(){
						oldDatePanel.remove();
					}, 300);

					var freeAttendees = this.model.get("free") || [];

					var free = [];
					var busy = [];

					_.each(App.attendees.models, function(att){
						var found = freeAttendees.indexOf(att.get('_id'));

						if (found != -1){
							free.push(att.get('prettyName'));
						} else {
							busy.push(att.get('prettyName'));
						}
					});

					this.sideInfoAttendees.each(function(index){
						var el = $(this);

						if (free.indexOf(el.find('.side-info-name').text()) !== -1){
							el.addClass('side-info-free');
						} else {
							el.removeClass('side-info-free');
						}

					});
				}
			}

			this.$el.show();

			if (this.sideInfoContainer.is(':visible')){
				if (App.infoRowView !== null){
					App.infoRowView.removeSelectedRow();
				}
			}
		}
	},

	prevDate: null,

	updateModel: function(model){
		var that = this;
		var dateGreater = true;

		if (this.model !== null && !_.isUndefined(this.model)){
			this.stopListening(this.model);
		}

		if (this.prevDate !== null && model !== null){
			if (this.prevDate < model.get('date')){
				dateGreater = false;
			}
		}

		if (model !== null){
			this.prevDate = model.get('date');
		}


		this.model = model;

		if (this.model !== null){
			this.listenTo(this.model, "change", this.modelChanged);
		}

		that.updateInPlace(dateGreater);
	},

	modelChanged: function(){
		this.updateInPlace(0);
	}
});
