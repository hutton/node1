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

			this.sideInfoPanel.hide();
		}
	},

	template: _.template($('#side-info-panel-template').html()),

	events: {
	},

	updateInPlace: function(dateGreater){
		var that = this;

		if (this.model === null && App.attendees.length > 1){
			this.sideInfoPanel.hide();
		} else {
			if (this.model !== null){
				if (App.attendees.length > 1){
					if (dateGreater !== 0){
						var oldDatePanel = this.sideInfoPanel.find('.side-info-date').first();

						var inClass = 'side-info-date-greater';
						var outClass = 'side-info-date-less';

						if (dateGreater < 0){
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
					}

					var free = [];
					var busy = [];

					_.each(App.attendees.models, function(att){
						if (that.model.isAttendeeFree(att.get('_id'))){
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

			this.sideInfoPanel.show();

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
		var dateGreater = 0;

		if (this.model !== null && !_.isUndefined(this.model)){
			this.stopListening(this.model);
		}

		if (this.prevDate !== null && model !== null){
			if (this.prevDate > model.get('date')){
				dateGreater = 1;
			} else if (this.prevDate < model.get('date')){
				dateGreater = -1;
			}
		}

		if (model !== null){
			this.prevDate = model.get('date');
		}

		this.model = model;

		if (this.model !== null){
			this.listenTo(this.model, "change", this.modelChanged);
		}

		if (this.model === null){
			_.delay(function(){
				if (that.model === null){
					that.updateInPlace(dateGreater);					
				}
			}, 500);
		} else {
			that.updateInPlace(dateGreater);
		}
	},

	modelChanged: function(){
		this.updateInPlace(0);
	}
});
