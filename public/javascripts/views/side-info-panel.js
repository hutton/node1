window.SideInfoPanel = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.$el.html(this.template({attendees: App.attendees.models}));

		$('.event-container').after(this.$el);

		this.sideInfoDate = this.$el.find('.side-info-date');

		this.sideInfoPanel = this.$el.find('.side-info-panel');

		this.sideInfoAttendees = this.$el.find('li');

		this.sideInfoList = this.$el.find('ul');

		this.sideInfoInvite = this.$el.find('.side-info-invite');

		this.sideInfoContainer = this.$el.find('.side-info-panel-container');

		if (App.attendees.length <= 1){
			this.sideInfoList.hide();
			this.sideInfoInvite.show();
			this.sideInfoDate.hide();
		} else {
			this.sideInfoList.show();
			this.sideInfoInvite.hide();

			this.$el.hide();
		}
	},

	template: _.template($('#side-info-panel-template').html()),

	events: {
	},

	updateInPlace: function(){
		if (this.model === null && App.attendees.length > 1){
			this.$el.hide();
		} else {
			if (this.model !== null){
				this.sideInfoDate.html(moment(this.model.get('date')).format("dddd <br/> Do MMMM"));

				if (App.attendees.length > 1){
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

	updateModel: function(model){
		var that = this;

		if (this.model !== null){
			this.stopListening(this.model);
		}

		this.model = model;

		if (this.model !== null){
			this.listenTo(this.model, "change", this.modelChanged);
		}

		that.updateInPlace();
	},

	modelChanged: function(){
		this.updateInPlace();
	}
});
