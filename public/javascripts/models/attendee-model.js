window.AttendeesModel = Backbone.Collection.extend({

	initialize: function() {
		var pathNames = window.location.pathname.split( '/' );

		this.url = "/event/" + pathNames[pathNames.length - 1] + "/attendee/";

	}
});
