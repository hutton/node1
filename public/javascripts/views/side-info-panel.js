window.SideInfoPanel = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);

		this.$el.html(this.template());

		$('.navbar-fixed-top').after(this.$el);

		this.$el.hide();

		this.sideInfoDate = this.$el.find('.side-info-date');
	},

	template: _.template($('#side-info-panel-template').html()),

	events: {
	},

	render: function(){
		if (this.model === null){
			this.$el.hide();
		} else {
			this.sideInfoDate.html(moment(this.model.get('date')).format("dddd <br/> Do MMMM"));

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
	}
});
