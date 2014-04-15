window.EventApp = Backbone.View.extend({
    initialize: function(){
        _.bindAll(this);
    },

    loadBootstrapData: function(bootstrapedChoices, bootstrappedAttendees, bootstrappedCalendar){
        this.model = new CalendarModel(bootstrappedCalendar);

        this.choices = new ChoicesModel;

        this.choices.reset(expandDates(bootstrapedChoices, this.model.get("everythingSelectable")));

        this.attendees = new Backbone.Collection;

        this.attendees.comparator = function(model){

            return !model.get('me');
        };

        this.attendees.reset(bootstrappedAttendees);

        this.currentAttendee = this.attendees.findWhere({me: true});

        this.currentAttendeeId = this.currentAttendee != null ? this.currentAttendee.get("_id") : -1;

        if (_.isUndefined(this.currentAttendee)){
            this.currentAttendee = null;

            this.newMode = true;

            this.attendees.add({"prettyName": "Me", "_id": "new", "me" : true}, {"at": 0});
        }

        this.ChoicesView = new ChoicesView({collection: this.choices, attendees: this.attendees});

        this.ChoicesView.render();

        this.TopChoicesModel = new Backbone.Model({
            one: null,
            two: null,
            three: null
        });

        // this.TopChoicesPanel = new TopChoicesPanel({model: this.TopChoicesModel});

        this.LoaderView = new LoaderView();

        this.LoaderView.calendarModel = this.model;
        this.LoaderView.attendees = this.attendees;

        this.AttendeesView = new AttendeesView({collection: this.choices, model: this.TopChoicesModel});

        this.SettingsView = new SettingsView();

        this.SelectDatesView = new SelectDatesView({collection: this.choices});

        var pathNames = window.location.pathname.split( '/' );

        this.currentId = pathNames[pathNames.length - 1];

        this.render();

        this.checkForOrientationChange();

        this.scrollToFirstSelectable();

        this.LoaderView.show();
    },

    el: $("body"),

    today: new Date(new Date().toDateString()),

    events: {
        "click #show-info":             "infoClicked",
        "keyup #register-attendee-email-input": "registerAttendeeInputChanged",
        "click .mode-switch-calender":  "switchToCalendar",
        "click .mode-switch-attendees": "switchToAttendees",
        "click .join-event":            "showJoinEvent", 
        "click .title":                 "showLoader"    
    },

    selectedRowTemplate: _.template($('#selected-row-template').html()),

    isFree: [],

    wasFree: [],

    showInfo: false,

    infoClicked: function(){

        this.SettingsView.show();

        this.showInfo = !this.showInfo;
    },

    topNavBarEl: $(".navbar-fixed-top"),

    scrollStarted: false,

    newMode: false,

    selectableDateMode: false,

    render: function(){
        var that = this;

        if (this.newMode){
            _.delay(function(){
                that.$el.find('.join-event').removeClass('join-event-hidden');    
            }, 1000);

            this.titleMailEl.click(function(){ 
                that.showNewModeMail();
            });

        } else {
            this.updateTellEveryoneLink();
            this.recalcTopSpacer();

            this.$el.find('#show-info').show();
            this.$el.find('#title-button-help').hide();
        }

        this.$el.find("#register-form").attr("action", "/event/" + this.currentId + "/add/");

        this.SettingsView.initialize();

        this.showBestChoices();

        if (!this.model.get('datesSelected')){
            this.changeSelectableDates();
        }

        this.instantResize();
        this.onResizeWindow();

        _.delay(function(){
            that.titleResize();
        }, 100);

        var throttledResize = _.debounce(that.onResizeWindow, 100);

        $(window).resize(function(){
            throttledResize();
            that.instantResize();
        });
    },

    realignAdorners: function(){
        if (this.TopChoicesModel.has("one")){
            this.TopChoicesModel.get("one").trigger("repositioned");
        }

        if (this.TopChoicesModel.has("two")){
            this.TopChoicesModel.get("two").trigger("repositioned");
        }

        if (this.TopChoicesModel.has("three")){
            this.TopChoicesModel.get("three").trigger("repositioned");
        }
    },

    onResizeWindow: function(){
        this.ChoicesView.resize();
        this.AttendeesView.resize();

        var width = $(window).width();
        var height = $(window).height();

        if (height < 350){
            this.showHeader(false);
            this.AttendeesView.show();
        } else {
            this.showHeader(true);
        }

        this.titleResize();
    },

    instantResize: function(){
        this.titleResize();
    },

    titleResize: function(){
        var maxFontSize = 21;
        var minFontSize = 12;

        var fontSize = maxFontSize;

        var titleEl = $('.title');

        titleEl.css({'font-size': fontSize});
        titleEl.css({'line-height': '30px'});

        while (titleEl.height() > 42 && fontSize > minFontSize)
        {
            titleEl.css({'font-size': fontSize});

            fontSize -= 2;
        }

        if (titleEl.height() > 42 && fontSize <= minFontSize){
            titleEl.css({'line-height': '16px'});
        }
    },

    checkOrientation: function(){
        if(window.orientation !== this.previousOrientation){
            this.previousOrientation = window.orientation;

            if (window.orientation === 0 || window.orientation === 180){
                this.switchToCalendar();
            } else {
                this.switchToAttendees();
            }

            // this.trigger('orientation', window.orientation);
        }
    },

    checkForOrientationChange: function(){
        this.previousOrientation = window.orientation;

        window.addEventListener("resize", this.checkOrientation, false);
        window.addEventListener("orientationchange", this.checkOrientation, false);

        // (optional) Android doesn't always fire orientationChange on 180 degree turns
        //setInterval(this.checkOrientation, 2000);
    },

    registerAttendeeInputChanged: function(event){
        if (event.which != 13){
            var message = $(".register-attendee-message");

            message.html("");
            messages.slideUp('fast');
        }
    },

    isEmailAddressValid: function(email){
            //var re = /([a-zA-Z0-9\._-])+@([a-zA-Z0-9\._-])+/;
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        var matches = email.match(re);

        return !_.isUndefined(matches) && matches !== null;
    },

    changesMadeLinkkeyEl: $(".changes-made-email-link"),

    updatedFooterEl: $("#updated-footer"),

    titleMailEl: $("#title-mail"),

    switchedUpdateAttendeesLink: false,

    updateTellEveryoneLink: function(){
        var mailTo = "mailto:" + this.model.get("id") + "@convenely.com?subject=RE:" + encodeURIComponent(" " +this.model.get("name")) + "&body=" + encodeURIComponent(this.formatUpdatedDays(this.isFree, this.wasFree));

        this.changesMadeLinkkeyEl.attr("href", mailTo);
    },

    formatUpdatedDays: function(isFree, wasFree){
        if (isFree.length > 0){
            if (wasFree.length > 0) {
                return "I'm now free on " + this.buildDatesString(isFree) + " but I'm no longer free on " + this.buildDatesString(wasFree) + ".";
            } else {
                return "I'm now free on " + this.buildDatesString(isFree) + ".";
            }
        } else if (wasFree.length > 0){
            return "I'm no longer free on " + this.buildDatesString(wasFree) + ".";
        }

        return "";
    },

    buildDatesString: function(dates){
        var text = "";

        dates = dates.sort(function(date1, date2){
            return date1 > date2;
        });

        var datesFormatted = _.map(dates, function(date){
            return moment(date).format("dddd Do MMMM");
        });

        if (datesFormatted.length > 0){
            if (datesFormatted.length == 1){
                text = text + datesFormatted[0];
            } else {
                text = text + datesFormatted.slice(0, -1).join(", ") + " and " + datesFormatted[datesFormatted.length - 1];
            }
        }

        return text;
    },

    validateEmail: function(){
        var email = $("#register-attendee-email-input");

        var message = $(".register-attendee-message");

        if (email.val() === null || email.val() === ""){
            message.html("Please enter your email address");
            message.slideDown('fast');

            return false;
        }

        if (!this.isEmailAddressValid(email.val())){
            message.html("Please enter a valid email address");
            message.slideDown('fast');

            return false;
        }
    },

    showBestChoices: function(){
        var that = this;
        var bestModel = null;
        var bestCount = 0;

        var secondBestModel = null;
        var secondBestCount = 0;

        var thirdBestModel = null;
        var thirdBestCount = 0;

        var modelsWithTopChoice = [];

        _.each(this.choices.models, function(model){
            var freeCount = 0;
            
            if (model.isSelectable() && model.has('date') && model.get('date') >= that.today){
                if (model.has('free')){
                    freeCount += model.get('free').length;
                }
                
                freeCount += (model.pretendFree ? 1 : 0);

                if (freeCount > bestCount){
                    thirdBestCount = secondBestCount;
                    thirdBestModel = secondBestModel;

                    secondBestCount = bestCount;
                    secondBestModel = bestModel;

                    bestCount = freeCount;
                    bestModel = model;
                } else if (freeCount > secondBestCount){
                    thirdBestCount = secondBestCount;
                    thirdBestModel = secondBestModel;

                    secondBestCount = freeCount;
                    secondBestModel = model;
                } else if (freeCount > thirdBestCount){
                    thirdBestCount = freeCount;
                    thirdBestModel = model;
                }

                if (model.has('top-choice')){
                    modelsWithTopChoice.push(model);
                }
            }
        });

        if (bestModel !== null){
            bestModel.setTopChoice(1);
            $('.calendar-choices-top-one').show();
        } else {
            $('.calendar-choices-top-one').hide();
        }

        if (secondBestModel !== null){
            secondBestModel.setTopChoice(2);
            $('.calendar-choices-top-two').show();
        } else {
            $('.calendar-choices-top-two').hide();
        }

        if (thirdBestModel !== null){
            thirdBestModel.setTopChoice(3);
            $('.calendar-choices-top-three').show();
        } else {
            $('.calendar-choices-top-three').hide();
        }

        _.each(modelsWithTopChoice, function(model){
            if (model !== bestModel && model !== secondBestModel && model !== thirdBestModel){
                model.unset('top-choice');
            }
        });

        this.TopChoicesModel.set({'one': bestModel, 'two': secondBestModel, 'three': thirdBestModel});
    },

    recalcTopSpacer: function(){
        if (this.$el.find(".navbar-fixed-top").is(':visible')){
            var topNavBarHeight = this.$el.find(".navbar-fixed-top").height();

            this.$el.find(".event-container").css({'padding-top': topNavBarHeight});

            this.$el.find(".selecting-dates-container").css("top", topNavBarHeight);
        } else {
            this.$el.find(".event-container").css({'padding-top': 0});
            this.$el.find(".selecting-dates-container").css("top", 0);
        }
    },

    showHeader: function(show){
        if (show){
            this.$el.find('.navbar-fixed-top').show();
        } else {
            this.$el.find('.navbar-fixed-top').hide();
        }

        this.recalcTopSpacer();
    },

    switchToCalendar: function(){
        this.$el.find('.mode-switch-calender').addClass('mode-switch-selected');
        this.$el.find('.mode-switch-attendees').removeClass('mode-switch-selected');

        this.ChoicesView.active(true);
        this.AttendeesView.active(false);
    },

    switchToAttendees: function(){
        this.$el.find('.mode-switch-calender').removeClass('mode-switch-selected');
        this.$el.find('.mode-switch-attendees').addClass('mode-switch-selected');

        this.ChoicesView.active(false);
        this.AttendeesView.active(true);
    },

    changeSelectableDates: function(){
        this.SelectDatesView.show();
    },

    selectedModel: null,

    setSelected: function(model){
        if (this.selectedModel !== model){
            if (this.selectedModel !== null){
                this.selectedModel.set('selected', false);
            }

            this.selectedModel = model;

            if (model !== null){
                model.set('selected', true);

                this.AttendeesView.setActive(model);
            }
        }
    },

    scrollToFirstSelectable: function(){
        var firstSelectableChoice = this.choices.findWhere({selectable: true});

        if (firstSelectableChoice !== null && !_.isUndefined(firstSelectableChoice)){
            firstSelectableChoice.trigger('scrollToTopLine');
        }
    },

    scrollToSelected: function(){
        var firstSelectedChoice = this.choices.findWhere({selected: true});

        if (firstSelectedChoice !== null && !_.isUndefined(firstSelectedChoice)){
            firstSelectedChoice.trigger('scrollToTopLine');
        }
    },

    showJoinEvent: function(){
        var modal = $('#join-view');

        var label = modal.find('.join-view-text');

        if (this.isFree.length === 0){
            label.html("You've not selected any dates but that's fine.");
        } else if (this.isFree.length === 1) {
            label.html("You have selected one date.");
        } else {
            label.html("You have selected " + this.isFree.length + " dates.");
        }

        modal.modal({show: true});
    },

    showNewModeMail: function(){
        var modal = $('#new-mode-mail-view');

        modal.modal({show: true});
    },

    showLoader: function(){
        this.LoaderView.show();
    }
});
