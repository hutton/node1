window.SideInfoPanel = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.$el.html(this.template({attendees: App.attendees.models}));

		$('.navbar-fixed-top').after(this.$el);

		this.$el.hide();

		this.sideInfoDate = this.$el.find('.side-info-date');

		this.sideInfoAttendees = this.$el.find('li');
	},

	template: _.template($('#side-info-panel-template').html()),

	events: {
	},

	render: function(){
		if (this.model === null){
			this.$el.hide();
		} else {
			this.sideInfoDate.html(moment(this.model.get('date')).format("dddd <br/> Do MMMM"));

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
					el.find('.side-info-free').show();
				} else {
					el.find('.side-info-free').hide();
				}

			});

			this.$el.show();
		}
	},

	updateModel: function(model){
		if (this.model !== null){
			this.stopListening(this.model);
		}

		this.model = model;

		if (this.model !== null){
			this.listenTo(this.model, "change", this.modelChanged);
		}

		this.render();
	},

	modelChanged: function(){
		this.render();
	}

});
