window.Workspace = Backbone.Router.extend({

    routes: {
        "event/:query":             "loader",
        "example":             "loader",
        "event/:query/calendar":    "calendar",
        "event/:query/details":     "details"
    },

    loader: function() {
        App.showLoader();
    },

    calendar: function() {
        App.LoaderView.close();

        App.showCalendar();
    },

    details: function() {
        App.LoaderView.close();

        App.showEventSettings();
    },
});

