window.SideInfoPanel = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},

	template: _.template($('#side-info-panel-template').html()),

	events: {
	},

	initialise: function(){
		_.bindAll(this);
	}
});
