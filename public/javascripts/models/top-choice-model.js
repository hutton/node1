window.TopChoicesModel = Backbone.Model.extend({
	initialize: function() {
		this.listenTo(App.attendees, "remove", this.updateTopChoice);
	},
	
	updateTopChoice: function(){
        var bestModel = null;
        var bestCount = 0;

        var secondBestModel = null;
        var secondBestCount = 0;

        var thirdBestModel = null;
        var thirdBestCount = 0;

        var modelsWithTopChoice = [];

        _.each(App.choices.models, function(model){
            var freeCount = 0;
            
            if (model.isSelectable() && model.has('date') && model.get('date') >= App.today){
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
        }

        if (secondBestModel !== null){
            secondBestModel.setTopChoice(2);
        }

        if (thirdBestModel !== null){
            thirdBestModel.setTopChoice(3);
        }

        _.each(modelsWithTopChoice, function(model){
            if (model !== bestModel && model !== secondBestModel && model !== thirdBestModel){
                model.unset('top-choice');
            }
        });

        this.set({'one': bestModel, 'two': secondBestModel, 'three': thirdBestModel});
	}
});
