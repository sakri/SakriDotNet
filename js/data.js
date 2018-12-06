/**
 * DEPENDENCIES:
 * MathLib,
 */

(function() {

    window.AppConfig = {};
    AppConfig.appBgColor = "#f3f3f3";
    AppConfig.cardBgColor = "#ffffff";
    AppConfig.colorPalette = ["#049CD8", "#FBD000", "#E52521", "#43B047"];
    AppConfig.getRandomPaletteColor = function(){
        return this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
    };
    AppConfig.themeColor = AppConfig.colorPalette[Math.floor(Math.random() * AppConfig.colorPalette.length)];

    var _nextPaletteColorIndex = 0;
    AppConfig.getNextPaletteColor = function(){
        var color = this.colorPalette[_nextPaletteColorIndex % this.colorPalette.length];
        _nextPaletteColorIndex++;
        return color;
    };

    var appParamsUrl = new URL(window.location.href);
    AppConfig.noJs = appParamsUrl.searchParams.get("noJs") == "true";
    AppConfig.loopLoader = appParamsUrl.searchParams.get("loopLoader") == "true";
    AppConfig.visitStats = appParamsUrl.searchParams.get("visitStats");//TODO: consider renaming to "visitStatsString" (more descriptive)


    AppConfig.checkNoJs = function(){
        if(this.noJs){
            console.log("Parameter noJs set to true, displaying no javascript version.");
        }
        return this.noJs;
    };

    //Z-index management (TODO: rename all starting with zIndex (zIndexLoaderCanvas etc.) or AppConfig.zIndex.loaderCanvas
    AppConfig.zIndexLoaderCanvas = 100;
    AppConfig.zIndexLoaderTitle = 110;
    AppConfig.zIndexCardHtml = 200;
    AppConfig.zIndexMenuButton = 210;
    AppConfig.zIndexSpeechBubble = 220;
    AppConfig.zIndexNavigationButton = 300;
    AppConfig.zIndexCloseButton = 310;
    AppConfig.zIndexDebugLayer = 500;

}());


(function() {

    window.CardData = function(){

        this.image = "";//card thumbnail
        this.themeColor = "#CCCCCC";
        this.title = "";
        this.contentLayout = undefined;//new CardContentLayout(origWidth, origHeight)
        this.headline = "";
        this.story = "";
        this.link = "";//action link (used to open other apps : portfolio, faq, blog)
        this.extraImages = undefined;//card image rotation

        //Card state related, maybe move
        this.visited = false;
        this.storyReadComplete = false;
    };

}());


(function() {

    window.AppData = {};//object, no need to instantiate

    //protected properties
    //TODO : Stats Module Related properties and methods need to move to another class
    var _visitStart = window["_scriptStart"] || new Date().getTime(),
        _actionsPerMinuteIntervalId = -1;

    //Public API
    AppData.cards = [];//list of CardData, MOVE, the rest is related to StatsModule

    AppData.getLoaderLabel = function(appName){
        var label = "sakri.net";
        switch (appName){
            case "faq":
                label = "f.a.q.";
                break;
            case "folio":
                label = "portfolio";
                break;
            case "blog":
                label = "blog";
                break;        }
        return label;
    };

    AppData.userInteractions = 0;
    AppData.shareClick = false;
    AppData.showStats = false;//TODO: implement fps counter
    AppData.statsVisited = false;
    AppData.celebrated = false;

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
    };

    AppData.stopInteractionsHistory = function(){
        clearInterval(_actionsPerMinuteIntervalId);
        _actionsPerMinuteIntervalId = -1;
    };

    AppData.createInteractionsHistorySegment = function(){
        this.interactionsHistory.shift();
        this.interactionsHistory.push(0);
    };

    AppData.storeInteraction = function(){
        this.userInteractions++;
        this.interactionsHistory[AppData.interactionsHistory.length - 1]++;
    };

    var _promptMessages = [
        "Click me for your stats!",
        "Doing great!",
        "Steady rockin!",
        "Like a Boss!!!",
        "You on FIRE!!!11",
        "Celebrate in 3-2-1..."
    ];
    //TODO: AppData shouldn't be accessed from here
    AppData.getMissionPromptMessage = function(missionProgressNormal){
        return this.statsVisited ? _promptMessages[Math.round((_promptMessages.length - 1) * missionProgressNormal)] : _promptMessages[0];
    };
    var _completedPromptMessages = [
        "Tell your friends!",
        "Tell yo mama!",
        "Sharing is caring!",
        "I'm @sakri on twitter..."
    ];
    AppData.getMissionCompletedPromptMessage = function(missionProgressNormal){
        return _completedPromptMessages[Math.floor(Math.random() * _completedPromptMessages.length)];
    };
    AppData.getPromptMessagesFunction = function(){
        return this.celebrated ? this.getMissionCompletedPromptMessage.bind(this) : this.getMissionPromptMessage.bind(this);
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

    var _visitNumRequiredOpenCards = 3,
        _visitNumRequiredArticles = 2,
        _visitNumRequiredSeconds = 60,
        _visitNumRequiredInteractions = 30;

    AppData.getStatsOpenedEnoughCardsNormal = function(){
        return Math.min(AppData.numCardsVisited() / _visitNumRequiredOpenCards, 1);//dangerous if there are less than "required" cards!
    };
    AppData.getStatsReadEnoughArticlesNormal = function(){
        return Math.min(AppData.numCardsStoryReadComplete() / _visitNumRequiredArticles, 1);//dangerous if there are less than "required" cards!
    };
    AppData.getStatsSpentEnoughTimeNormal = function(){
        return Math.min(AppData.secondsSinceStart() / _visitNumRequiredSeconds, 1);
    };
    AppData.getStatsOpenedAllCardsNormal = function(){
        return Math.min(AppData.numCardsVisited() / AppData.cards.length, 1);
    };
    AppData.getStatsClickEnoughShareButtonsNormal = function(){
        return AppData.shareClick ? 1 : 0;
    };
    AppData.getStatsEnoughInteractionsNormal = function(){
        return Math.min(AppData.userInteractions / _visitNumRequiredInteractions, 1);
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
        param += ("-" + Math.min(AppData.userInteractions, 30));//param 2
        param += ("-" + Math.min(AppData.secondsSinceStart(), 60));//param 3
        return "visitStats=" + param;
    };

    AppData.updateFromVisitStatsUrlParam = function(visitStatsString){
        if(!visitStatsString){
            return;
        }
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
            if (isNaN(stat) || stat > 255) {
                console.log("AppData.updateFromVisitStatsUrlParam() Invalid param, invalid stat[" + i + "] : ", stat);
                return;
            }
            parts[i] = stat;
        }
        var visitedBinaryString = parts[0].toString(2);
        //1000101
        if(visitedBinaryString.length - 1 !== this.cards.length){
            console.log("AppData.updateFromVisitStatsUrlParam() Invalid visits : ", visitedBinaryString);
            return;
        }
        var readBinaryString = parts[1].toString(2);
        if(readBinaryString.length - 1 !== this.cards.length){
            console.log("AppData.updateFromVisitStatsUrlParam() Invalid articles completed : ", readBinaryString);
            return;
        }
        var card;
        for(i=0; i<this.cards.length; i++){
            card = this.cards[i];
            card.visited = visitedBinaryString.charAt(i + 1) === "1";
            card.storyReadComplete = readBinaryString.charAt(i + 1) === "1";
        }
        this.userInteractions = parts[2];
        this.setVisitStart(parts[3] * 1000);
    };

    //-------------TESTING

    AppData.addMockCardVisit = function(){
        for(var i=0; i<this.cards.length; i++){
            if(!this.cards[i].visited){
                this.cards[i].visited = true;
                break;
            }
        }
    };

    AppData.addMockReachedEndOfArticle = function(){
        for(var i=0; i<this.cards.length; i++){
            if(!this.cards[i].storyReadComplete){
                this.cards[i].storyReadComplete = true;
                break;
            }
        }
    };

    /* TODO: NOT WORKING */
    AppData.addMockToVisitDurationMS = function(addMS){
        this.setVisitStart(this.msSinceStart() + addMS);
    };

    AppData.addMockActions = function(numActions){
        this.userInteractions += numActions;
        this.interactionsHistory[AppData.interactionsHistory.length - 1]++;
    };

    AppData.completeMockVisit = function(){
        while(this.getStatsOpenedAllCardsNormal() < 1){
            this.addMockCardVisit();
        }
        while(this.getStatsReadEnoughArticlesNormal() < 1){
            this.addMockReachedEndOfArticle();
        }
        this.addMockToVisitDurationMS(_visitNumRequiredSeconds * 1000);
        this.shareClick = true;
        this.addMockActions(_visitNumRequiredInteractions);
    };

    //TODO: move?
    AppData.setMockData = function(total){
        this.cards = this.generateMockData(total);
    };

    AppData.generateMockData = function(total){
        var totalCards = total || MathUtil.getRandomNumberInRange(3, 8);
        var i, data, _dataList = [];
        for(i=0; i<totalCards; i++){
            data = new CardData();
            data.themeColor = AppConfig.getNextPaletteColor();
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

    AppData.getMitchHedbergQuotes = function(){
        return _mitchHedbergQuotes.slice();
    };

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
