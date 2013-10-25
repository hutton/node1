window.ChoiceModel = Backbone.Model.extend({

	initialize: function() {},

	url: "/event/" + window.location.toString().slice(-5) + "/choice/",

});