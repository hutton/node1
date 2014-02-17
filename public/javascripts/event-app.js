window.EventApp = Backbone.View.extend({
    initialize: function(){
        _.bindAll(this);
    },

    loadBootstrapData: function(bootstrapedChoices, bootstrappedAttendees, bootstrappedCalendar){
        this.choices = new ChoicesModel;

        this.choices.reset(expandDates(bootstrapedChoices));

        this.attendees = new Backbone.Collection;

        this.attendees.reset(bootstrappedAttendees);

        this.model = new CalendarModel(bootstrappedCalendar);

        this.currentAttendee = this.attendees.findWhere({me: true});

        this.currentAttendeeId = this.currentAttendee != null ? this.currentAttendee.get("_id") : -1;

        if (_.isUndefined(this.currentAttendee)){
            this.currentAttendee = null;
        }

        this.ChoicesView = new ChoicesView({collection: this.choices, attendees: this.attendees});

        this.ChoicesView.render();

        this.AttendeesView = new AttendeesView({collection: this.choices});

        this.SideInfoPanel = new SideInfoPanel();

        this.TopChoicesModel = new Backbone.Model({
            one: null,
            two: null,
            three: null
        });

        this.TopChoicesPanel = new TopChoicesPanel({model: this.TopChoicesModel});

        var pathNames = window.location.pathname.split( '/' );

        this.currentId = pathNames[pathNames.length - 1];

        this.render();

        this.checkForOrientationChange();
    },

    el: $("body"),

    today: new Date(new Date().toDateString()),

    events: {
        "click #show-info":             "infoClicked",
        "click .title":                 "infoClicked",
        "click":                        "eventTableClicked",
//      "click #add-attendee":          "addAttendeeClicked",
        "click #add-attendee-link":     "addAttendeeLinkClicked",
        "click #add-attendee-cancel-link": "addAttendeeCancelClicked",
        "keyup #add-attendee-email-input": "addAttendeeInputChanged",
        "keyup #register-attendee-email-input": "registerAttendeeInputChanged",
        "click .mode-switch-calender":  "switchToCalendar",
        "click .mode-switch-attendees":     "switchToAttendees",
    },

    selectedRowTemplate: _.template($('#selected-row-template').html()),

    isFree: [],

    wasFree: [],

    infoClicked: function(){
        this.$el.find(".info").slideToggle("fast");

        this.$el.find("#show-info > span").toggleClass("show-info-rotate");
    },

    topNavBarEl: $(".navbar-fixed-top"),

    scrollStarted: false,

    render: function(){
        var that = this;

        this.$el.find(".title").html(this.model.get("name"));

        var nameList = "";  
        _.each(this.attendees.models, function(model){
            if (model.get("me")){
                nameList = "<strong>" + model.get("prettyName") + "</strong>, " + nameList;
            } else {
                nameList = nameList + model.get("prettyName") + ", ";
            }
        });

        nameList = nameList.slice(0, -2);

        this.$el.find(".attendees").html(nameList);

        if (this.currentAttendee === null){
            this.$el.find("#add-attendee").hide();

            this.$el.find('#register-footer').show();
        } else {
            this.recalcTopSpacer();
        }

        this.$el.find("#register-form").attr("action", "/event/" + this.currentId + "/add/");

        this.updateTellEveryoneLink();

        this.showBestChoices();

        this.onResizeWindow();

        var throttled = _.debounce(that.onResizeWindow, 200);

        $(window).resize(function(){
            throttled();
        });

        // _.delay(function(){
        //  $(window).on("scrollstart touchmove", function(){

        //      if (!this.scrollStarted){
        //          this.scrollStarted = true;
        //          // $('.choice-pointer').addClass('choice-pointer-show');

        //          // that.topNavBarEl.addClass("faded");
        //      }
        //  });
        //  $(window).on("scrollstop", function(){
        //      this.scrollStarted = false;
        //      //that.topNavBarEl.removeClass("faded");

        //      _.delay(function(){
        //          // $('.choice-pointer').removeClass('choice-pointer-show');
        //      }, 400);

        //  });
        // }, 1000);
    },

    onResizeWindow: function(){
        console.log("Resize");

        var size = $(".event-table .date-cell").first().width();
        var windowSize = Math.min($("body").first().width(), 600);
        
        var table = $(".event-table");
        var parent = table.parent();
         
        table.detach();
         
        table.find("tr > td > .date-cell-container").height(size - 6);
        table.find("tr > td > .month").height(size - 6);

        table.find(".info-row-names").width(windowSize - 132);
         
        parent.append( table );

        var width = $(window).width();
        var height = $(window).height();

        if (height < 600 || width < 400){
            this.showFooter(false);
        } else {
            this.showFooter(true);
        }

        if (height < 350){
            this.showHeader(false);
        } else {
            this.showHeader(true);
        }
    },

    checkOrientation: function(){
        if(window.orientation !== this.previousOrientation){
            this.previousOrientation = window.orientation;

            console.log("Orientation Changed");


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

    eventTableClicked: function(event){
        var target = $(event.target);

        if ( !$(event.target).hasClass("date-cell") &&
            target.parents("td.date-cell").length === 0 &&
            target.parents(".info-row").length === 0){

            if (this.infoRowView !== null){
                this.infoRowView.removeSelectedRow();
            }
        }
    },

    infoRowView: null,

    updateSelectedItem: function(choiceModel, selectedRow){
        if (this.infoRowView === null){
            this.infoRowView = new InfoRowView({model: choiceModel, el: selectedRow});
        } else {
            this.infoRowView.update(choiceModel, selectedRow);
        }
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

    registerFooterEl: $("#register-footer"),

    titleMailEl: $("#title-mail"),

    topRowSpacerEl: $("#top-row-spacer"),

    switchedUpdateAttendeesLink: false,

    updateTellEveryoneLink: function(){
        var mailTo = "mailto:" + this.model.get("id") + "@convenely.com?subject=RE:" + encodeURIComponent(" " +this.model.get("name")) + "&body=" + encodeURIComponent(this.formatUpdatedDays(this.isFree, this.wasFree));

        this.changesMadeLinkkeyEl.attr("href", mailTo);
    },

    swtichUpdateAttendeesLink: function(){
        this.titleMailEl.show();

        var targetOffset = this.$el.find('#changes-made-banner > .fa-envelope-o').offset();
        var sourceOffset = this.titleMailEl.find('.fa-envelope-o').offset();

        this.titleMailEl.hide();

        var newTop = (targetOffset.top - sourceOffset.top) + 6;
        var newLeft = (targetOffset.left - sourceOffset.left) + 8;

        var that = this;

        this.titleMailEl.css({ "left": newLeft + "px", "top": newTop + "px", "-webkit-transform": "scale(0.7,0.7)" });

        _.delay(function(){
            that.titleMailEl.show();

            that.$el.find('#changes-made-banner > .fa-envelope-o').hide();

            that.updatedFooterEl.slideUp('fast');

            _.delay(function(){
                that.titleMailEl.removeAttr("style");
            }, 10);
        }, 10);
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
        var bestModel = null;
        var bestCount = 0;

        var secondBestModel = null;
        var secondBestCount = 0;

        var thirdBestModel = null;
        var thirdBestCount = 0;

        _.each(this.choices.models, function(model){
            if (model.has('free')){
                var freeCount = model.get('free').length;

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
                    model.set('top-choice', 0);
                }
            }
        });

        if (bestModel !== null){
            bestModel.set('top-choice', 1);
        }

        if (secondBestModel !== null){
            secondBestModel.set('top-choice', 2);
        }

        if (thirdBestModel !== null){
            thirdBestModel.set('top-choice', 3);
        }

        this.TopChoicesModel.set({'one': bestModel, 'two': secondBestModel, 'three': thirdBestModel});
    },

    recalcTopSpacer: function(){
        if (this.$el.find(".navbar-fixed-top").is(':visible')){
            this.$el.find("#top-row-spacer").height(this.$el.find(".navbar-fixed-top").height());
        } else {
            this.$el.find("#top-row-spacer").height(0);
        }
    },

    showFooter: function(show){
        if (show){
            this.$el.find('.navbar-fixed-bottom').show();
        } else {
            this.$el.find('.navbar-fixed-bottom').hide();
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

        this.onResizeWindow();
    },

    switchToAttendees: function(){
        this.$el.find('.mode-switch-calender').removeClass('mode-switch-selected');
        this.$el.find('.mode-switch-attendees').addClass('mode-switch-selected');

        this.ChoicesView.active(false);
        this.AttendeesView.active(true);
    }
});
