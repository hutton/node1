window.SideInfoPanel = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.$el.html(this.template());

		$('.event-container').after(this.$el);

		this.sideInfoContainer = this.$el.find('.side-info-panel-container');

		this.panelContainer = this.sideInfoContainer.children().first();
	},

	template: _.template($('#side-info-panel-container-template').html()),

	panelTemplate: _.template($('#side-info-panel-template').html()),

	events: {
	},

	dateChangedUpdate: function(dateGreater){
		var that = this;

		if (this.model === null && App.attendees.length > 0){
			this.panelContainer.hide();
		} else {
			if (this.model !== null){
				if (App.attendees.length > 0){
					if (dateGreater !== 0){
						var oldPanel = this.panelContainer.find('.side-info-panel').first();

						var inClass = 'side-info-panel-greater';
						var outClass = 'side-info-panel-less';

						if (dateGreater < 0){
							inClass = 'side-info-panel-less';
							outClass = 'side-info-panel-greater';
						}

						var showInviteLink = false;

						if (App.attendees.length <= 1){
							showInviteLink = true;
						}

						var newPanel = $(this.panelTemplate({attendees: App.attendees.models, choices: this.model, date: moment(this.model.get('date')).format("dddd <br/> Do MMMM"), showInviteLink: showInviteLink}));

						newPanel.addClass(inClass);

						this.panelContainer.prepend(newPanel);

						_.delay(function(){
							that.panelContainer.find('.side-info-panel').first().removeClass(inClass);
						}, 20);

						oldPanel.addClass(outClass);

						_.delay(function(){
							oldPanel.remove();
						}, 300);
					}
				}
			}

			this.panelContainer.show();

			if (this.sideInfoContainer.is(':visible')){
				if (App.infoRowView !== null){
					App.infoRowView.removeSelectedRow();
				}
			}
		}
	},

	updateInPlace: function(){
		var that = this;

		var free = [];
		var busy = [];

		_.each(App.attendees.models, function(att){
			if (that.model.isAttendeeFree(att.get('_id'))){
				free.push(att.get('prettyName'));
			} else {
				busy.push(att.get('prettyName'));
			}
		});

		var panel = this.panelContainer.find('.side-info-panel li').first();

		panel.each(function(index){
			var el = $(this);

			if (free.indexOf(el.find('.side-info-name').text()) !== -1){
				el.addClass('side-info-free');
			} else {
				el.removeClass('side-info-free');
			}
		});
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
					that.dateChangedUpdate(dateGreater);					
				}
			}, 500);
		} else {
			that.dateChangedUpdate(dateGreater);
		}
	},

	modelChanged: function(){
		this.updateInPlace();
	}
});
