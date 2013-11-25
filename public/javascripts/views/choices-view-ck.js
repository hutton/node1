window.ChoiceView=Backbone.View.extend({initialize:function(){_.bindAll(this)},template:_.template($("#choice-template").html()),events:{"click div:first":"dayClicked"},pie:null,className:"date-cell",render:function(){this.$el.html(this.template(this.model.attributes));this.pie=this.$el.find(".pie");this.updateFreeCounter(!1);return this},updateFreeCounter:function(e){if(this.model.has("free")){var t=this.model.get("free");this.targetDeg=this.calcDegrees(window.App.attendees.length,t.length);if(e)this.animatePie();else{this.pie.attr("data-value",this.targetDeg);this.targetDeg>=180?this.pie.addClass("big"):this.pie.removeClass("big")}window.App.currentAttendee!==null&&t.indexOf(window.App.currentAttendee.get("_id"))!=-1&&this.$el.find(".unknown").addClass("free").removeClass("unknown")}},animatePie:function(){var e=parseInt(this.pie.attr("data-value")),t=0;e<this.targetDeg&&(t=10);e>this.targetDeg&&(t=-10);if(t!==0){this.pie.attr("data-value",e+t);e+t>=180?this.pie.addClass("big"):this.pie.removeClass("big");_.delay(this.animatePie,15)}},dayClicked:function(e){var t=$(this.$el).find("div:first");if(t.hasClass("selected")){t.find("div:nth-of-type(2)").toggleClass("free");t.find("div:nth-of-type(2)").toggleClass("unknown");this.toggleFree()}else{$(".selected").removeClass("selected");t.addClass("selected")}var n=t.parents("tr");App.updateSelectedItem(this.model,n)},toggleFree:function(){var e=this.model.get("date");if(window.App.currentAttendee!=null){var t=window.App.currentAttendee.get("_id"),n=this.model.get("free");if(_.isUndefined(n)||n.indexOf(t)==-1){_.isUndefined(n)?this.model.set("free",[t]):n.push(t);window.App.wasFree.indexOf(e)!=-1?window.App.wasFree.removeElement(e):window.App.isFree.push(this.model.get("date"))}else{n.removeElement(t);window.App.isFree.indexOf(e)!=-1?window.App.isFree.removeElement(e):window.App.wasFree.push(this.model.get("date"))}this.updateFreeCounter(!0);this.model.save();window.App.updateTellEveryoneLink()}else{window.App.isFree.indexOf(e)!=-1?window.App.isFree.removeElement(e):window.App.isFree.push(this.model.get("date"));window.App.updateRegisterLink()}},calcDegrees:function(e,t){return Math.round(t/e*36)*10}});window.ChoicesView=Backbone.View.extend({initialize:function(){_.bindAll(this);var e=this;this._choiceViews=[];this.collection.each(function(t){e._choiceViews.push(new ChoiceView({model:t,tagName:"td"}))})},el:$(".event-table"),monthTitleTemplate:_.template($("#month-title-template").html()),today:new Date,render:function(){var e=this;$(this.el).empty();var t=null,n=!1,r=!0;_(this._choiceViews).each(function(i){var s=i.model.get("date");if(s.getDay()==1){e.$el.append($("<tr></tr>"));t=e.$el.find("tr:last");rowItemCount=0}if(t!==null){s.getDate()==1&&(t=e.insertMonthTitle(rowItemCount,t,moment(s).format("MMMM")));t.append(i.render().el);rowItemCount++}if(!n&&sameDay(e.today,s)){var o=i.$el.find("div:first");o.addClass("today");n=!0}r&&(e.today<s||sameDay(e.today,s)?r=!1:i.$el.find("div:first").addClass("past"))});this.$el.find(".today")[0].scrollIntoView(!0);var i=$("body");i.scrollTop(i.scrollTop()-70);return this},insertMonthTitle:function(e,t,n){var r=e,i=0,s=!0,o=0;e>3&&(i=7-e);while(o<7){var u=$(this.monthTitleTemplate({month:n,showTitle:o==i}));if(s){u.removeClass("first-seven").addClass("first");s=!1}moment().format("MMMM")==n&&u.addClass("this-month");t.append(u);o++;if(o==7-e){this.$el.append($("<tr></tr>"));t=this.$el.find("tr:last")}}return t}});