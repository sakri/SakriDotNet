/**
 * DEPENDENCIES:
 * MathLib,
 */

(function() {

    window.appConfig = {}
    appConfig.appBgColor = "#ededed";
    appConfig.cardBgColor = "#ffffff";
    appConfig.colorPalette = ["#049CD8", "#FBD000", "#E52521", "#43B047"];
    appConfig.getRandomPaletteColor = function(){
        return this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
    };
    appConfig.themeColor = appConfig.colorPalette[Math.floor(Math.random() * appConfig.colorPalette.length)];

    var _nextPaletteColorIndex = 0;
    appConfig.getNextPaletteColor = function(){
        var color = this.colorPalette[_nextPaletteColorIndex % this.colorPalette.length];
        _nextPaletteColorIndex++
        return color;
    };

    var appParamsUrl = new URL(window.location.href);
    appConfig.noJs = appParamsUrl.searchParams.get("noJs") == "true";
    appConfig.loopLoader = appParamsUrl.searchParams.get("loopLoader") == "true";
    appConfig.visitStats = appParamsUrl.searchParams.get("visitStats");


    appConfig.checkNoJs = function(){
        if(this.noJs){
            console.log("Parameter noJs set to true, displaying no javascript version.");
        }
        return this.noJs;
    };

    //Z-index management
    appConfig.loaderCanvasZ = 100;
    appConfig.loaderTitleZ = 120;
    appConfig.menuButtonZ = 190;
    appConfig.effectsLayerZ = 200;
    appConfig.closeCardButtonZ = 250;
    appConfig.closeStatsButtonZ = 300;

}());


(function() {

    window.CardData = function(){

        this.image = "";
        //this.originalImageWidth, Height
        this.themeColor = "#CCCCCC";
        this.title = "";
        this.contentLayout = undefined;//new CardContentLayout(origWidth, origHeight)
        this.headline = "";
        this.story = "";
        this.link = "";

        //Card state related, maybe move
        this.visited = false;
        this.storyReadComplete = false;
        this.liked = false;
    };

}());


(function() {

    window.AppData = {};//object, no need to instantiate

    //protected properties
    //TODO : Stats Module Related properties and methods need to move to another class
    var _visitStart = window["_scriptStart"] || new Date().getTime(),
        _actionsPerMinuteIntervalId = -1;

    //Public API

    AppData.cards = [];//list of CardData
    AppData.userInteractions = 0;
    AppData.shareClick = false;
    AppData.viewStats = false;

    AppData.setVisitStart = function(msAgo){
        _visitStart = new Date().getTime() - msAgo;
    };

    AppData.msSinceStart = function(){
        return new Date().getTime() - _visitStart;
    };

    AppData.secondsSinceStart = function(){
        return Math.floor(this.msSinceStart()/1000);
    };

    AppData.minutesSinceStart = function(){
        var secs = AppData.secondsSinceStart();
        return Math.floor(secs / 60 + secs%60);
    };


    //TODO: move, belongs in it's own class
    AppData.interactionsHistory = [];//array of stored # of user interactions, cut up into "duration segments"

    AppData.startInteractionsHistory = function(historySegmentDurationMs, historyLength){
        if(_actionsPerMinuteIntervalId > -1){
            return;
        }
        var intervalDuration = historySegmentDurationMs  || 1000 * 10;
        //console.log("start history, historyLength : ", historyLength, ", intervalDuration : ", intervalDuration);
        for(var i=0; i<historyLength; i++){
            this.interactionsHistory[i] = 0;
        }
        _actionsPerMinuteIntervalId = setInterval(this.createInteractionsHistorySegment.bind(this), intervalDuration);//ticks once a minute
    }

    AppData.createInteractionsHistorySegment = function(){
        this.interactionsHistory.shift();
        this.interactionsHistory.push(0);
    };

    AppData.storeInteraction = function(){
        this.userInteractions++;
        this.interactionsHistory[AppData.interactionsHistory.length - 1]++;
    };



    AppData.numCardsVisited = function(){
        var visited = 0;
        for(var i=0; i<this.cards.length; i++){
            visited += this.cards[i].visited ? 1 : 0;
        }
        return visited;
    };

    AppData.numCardsStoryReadComplete = function(){
        var complete = 0;
        for(var i=0; i<this.cards.length; i++){
            complete += this.cards[i].storyReadComplete ? 1 : 0;
        }
        return complete;
    };

    AppData.getStatsOpenedEnoughCardsNormal = function(required){
        required = required || 3;
        return Math.min(AppData.numCardsVisited() / required, 1);//dangerous if there are less than "required" cards!
    };
    AppData.getStatsReadEnoughArticlesNormal = function(required){
        required = required || 2;
        return Math.min(AppData.numCardsStoryReadComplete() / 2, 1);//dangerous if there are less than "required" cards!
    };
    AppData.getStatsSpentEnoughTimeNormal = function(requiredSeconds){
        requiredSeconds = requiredSeconds || 60;
        return Math.min(AppData.secondsSinceStart() / requiredSeconds, 1);
    };
    AppData.getStatsOpenedAllCardsNormal = function(){
        return Math.min(AppData.numCardsVisited() / AppData.cards.length, 1);
    };
    AppData.getStatsClickEnoughShareButtonsNormal = function(){
        return AppData.shareClick ? 1 : 0;
    };
    AppData.getStatsEnoughInteractionsNormal = function(required){
        required = required || 30;
        return Math.min(AppData.userInteractions / required, 1);
    };

    //TODO: this uses default values for the moment! Make sure ok
    AppData.getAchievementNormal = function(){
        var total = this.getStatsOpenedEnoughCardsNormal();
        total += this.getStatsReadEnoughArticlesNormal();
        total += this.getStatsSpentEnoughTimeNormal();
        total += this.getStatsOpenedAllCardsNormal();
        total += this.getStatsClickEnoughShareButtonsNormal();
        total += this.getStatsEnoughInteractionsNormal();
        return total / 6;
    };

    //Temporary solution. Must be updated to reflect changes to data/logic.
    AppData.getVisitStatsUrlParam = function(){
        var visitedString = "1", articleReadString = "1", card, i;
        for(i=0; i < this.cards.length; i++){
            card = this.cards[i];
            visitedString += card.visited ? "1" : "0";
            articleReadString += card.storyReadComplete ? "1" : "0";
        }
        var param = parseInt(visitedString, 2) + "-" + parseInt(articleReadString, 2);//params 0 and 1
        param += ("-" + Math.min(AppData.userInteractions, 25));//param 2
        param += ("-" + Math.min(AppData.secondsSinceStart(), 50));//param 3
        return "visitStats=" + param;
    };

    AppData.updateFromVisitStatsUrlParam = function(visitStatsString){
        console.log("AppData.updateFromVisitStatsUrlParam()", visitStatsString);
        if(visitStatsString.indexOf("-") == -1){
            console.log("AppData.updateFromVisitStatsUrlParam() Invalid param, missing dash");
            return;
        }
        var parts = visitStatsString.split("-");
        if(parts.length != 4){
            console.log("AppData.updateFromVisitStatsUrlParam() Invalid param, incorrect number of stats");
            return;
        }
        var stat, statInt, i;
        for(i=0; i<4; i++) {
            stat = parseInt(parts[i]);
            if (isNaN(stat) || stat > 128) {
                console.log("AppData.updateFromVisitStatsUrlParam() Invalid param, invalid stat[" + i + "] : ", stat);
                return;
            }
            parts[i] = stat;
        }
        var visitedBinaryString = parts[0].toString(2);
        //1000101
        if(visitedBinaryString.length - 1 != this.cards.length){
            console.log("AppData.updateFromVisitStatsUrlParam() Invalid visits : ", visitedBinaryString);
            return;
        }
        var readBinaryString = parts[1].toString(2);
        if(readBinaryString.length - 1 != this.cards.length){
            console.log("AppData.updateFromVisitStatsUrlParam() Invalid articles completed : ", readBinaryString);
            return;
        }
        var card;
        for(i=0; i<this.cards.length; i++){
            card = this.cards[i];
            card.visited = visitedBinaryString.charAt(i + 1) == "1";
            card.storyReadComplete = readBinaryString.charAt(i + 1) == "1";
        }
        this.userInteractions = parts[2];
        this.setVisitStart(parts[3] * 1000);
    };

    AppData.copy = function(data){

    };

    //-------------TESTING

    AppData.setMockData = function(total){
        this.cards = this.generateMockData(total);
    }

    AppData.generateMockData = function(total){
        var totalCards = total || MathUtil.getRandomNumberInRange(3, 8);
        var i, data, _dataList = [];
        for(var i=0; i<totalCards; i++){
            data = new CardData();
            data.themeColor = appConfig.getNextPaletteColor();
            data.title = i + " o'clock mock";
            data.headline = "Look at my card #" + i + ", my card #" + i + " is amazing. Give it a lick, it tastes just like raisins" ;
            if(Math.random() > .75){
                data.story = "<p>Wouldn't want to waste your time, so here's some Mitch Hedberg:</p>";
                data.story += this.getMitchHedbergQuotesList();
            }else{
                //needs to be an element (doc.createElement("a") or something
                //data.link = "https://www.reddit.com/r/sakri/";
            }
            _dataList[i] = data;
        }
        return _dataList;
    };
    //one two three o'clock, four o'clock rock
    //five six seven o'clock, eight o'clock rock
    //nine ten eleven o'clock, twelve o'clock rock

    var _mitchHedbergQuotes = [
        "I'm against picketing, but I don't know how to show it.",
        "You know, I'm sick of following my dreams, man. I'm just going to ask where they're going and hook up with 'em later.",
        "An escalator cannot break. It can only become stairs.",
        "Rice is great if you're really hungry and want to eat 2000 of something.",
        "Whenever I go to shave, I assume there's someone else on the planet shaving, so I say \"I'm gonna go shave, too.\"",
        "I used to do drugs. I still do, but I used to, too.",
        "I haven't slept for ten days, because that would be too long.",
        "I think Pringles' original intention was to make tennis balls",
        "My friend asked me if I wanted a frozen banana. I said 'No, but I want a regular banana later. So, yeah.'"
    ];

    AppData.getRandomMitchHedbergQuote = function(){
        return _mitchHedbergQuotes[Math.floor(Math.random() * _mitchHedbergQuotes.length)];
    };

    AppData.getMitchHedbergQuotesList = function(numQuotes){
        var list = "<ul>";
        while(numQuotes--){
            list += "<li>" + this.getRandomMitchHedbergQuote() + "</li>"
        }
        return list + "</ul>";
    };

    //easy to call whenever from dev tools
    AppData.log = function(){
        console.log("AppData.logVisitStatus :");
        console.log("   > cards visited : ", this.numCardsVisited(), "/" , this.cards.length + ", end article : ", this.numCardsStoryReadComplete(), "/" + this.cards.length );
        console.log("   > duration : ", this.minutesSinceStart() + "m:" , this.secondsSinceStart(), "s",  "shareClick : ", this.shareClick , " interactions : ", this.userInteractions );
        console.log("   > actions per minute : " , this.interactionsHistory );
        return "";
    };

}());
