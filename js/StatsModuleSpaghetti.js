
/*  WARNING: QUICK AND DIRTY CODE
 *
  *
  * please do not read past this line, severe refactoring planned :D
  *
  * */




//quick access to required dom elements (bit of a crap solution)
var _ui = {
    requiredElementIds : ["appContainer", "interactionsContainer", "lineChartCanvas", "pieContainer",
        "pieChartContainer", "pieChartCanvas", "cardNotVisitedStatLabel", "cardVisitedStatLabel",
        "cardEndOfArticleStatLabel", "badgesContainer", "avatarCanvas", "badgesList", "achievementsTitle",
        "shareContainer", "sharePanel", "testControllers"],
    elements:{}
};

function initUIElements(){
    var i, id;
    for(i=0; i<_ui.requiredElementIds.length; i++){
        id = _ui.requiredElementIds[i];
        _ui.elements[id] = document.getElementById(id);
    }
};

//TODO: refactor _introComplete (quick hack)
var _maxAppWidth = 800, _appWidth, _appHeight, _introComplete = false, _lineChart, _pieChart;

function getAppWidth(){
    return _appWidth;
};

function init(){
    console.log("StatsModule.init()");
    _lineChart = new LineChart("#f7f7f7");//hardcoded, needs to match .statsContainer background-color
    _pieChart = new PieChart("#f7f7f7");
    initUIElements();
    if(window["isEmbedded"]){
        console.log("isEmbedded :", isEmbedded);
        _ui.elements.testControllers.style.display = "none";
        return;
    }
    initStandalone();
};

function initStandalone(){
    AppData.setMockData();
    AppData.startInteractionsHistory(10000, 6);
    SakriDotNetSpriteSheet.init();
    showStats(true);
};

var gtag, _celebrateCompleteCallback, _showCoseButtonCallback;//TODO: move to events, callbacks suck (last minute hacks)

function initFromApp(data, sprites, googleAnalyticsTag, showShareCallback, celebrateCompleteCallback){
    //override with data from home page, if inside iframe. A bit slightly very hackish... :D
    console.log("StatsModule.initFromApp()");
    window.AppData = data;
    window.SakriDotNetSpriteSheet = sprites;
    gtag = googleAnalyticsTag;
    if(_celebrateCanvas){
        _celebrateCanvas.display == "none";
    }
    _showCoseButtonCallback = showShareCallback;
    _celebrateCompleteCallback = celebrateCompleteCallback;
};

var _introScrollToTargets, _vIntroTarget, _previousIntroTarget, _unitAnimator = new UnitAnimator(),
    _introScrollFrom, _introScrollTo;

function showStats(){
    document.body.style.overflowY = "hidden";
    document.body.style.overflowX = "hidden";
    _introComplete = false;
    document.body.style.opacity = 1;
    _vIntroTarget = _ui.elements.interactionsContainer;
    _introScrollToTargets = [_ui.elements.pieContainer, _ui.elements.badgesContainer];
    _celebrateTimeoutId = -1;
    commitWindowResize();

    scrollToStats();
    showNextAchievement();//sets _introComplete
};

function scrollToStats(){
    if(_appWidth < _maxAppWidth){
        scrollTo(0, document.body.scrollHeight - AppLayout.bounds.height);
    }
}

function updateWidgets(){
    updateInteractionsCanvas();
    updatePieChartCanvas();
    updateBadges();
};

function updatePieChartCanvas(){
    var visited = AppData.numCardsVisited();
    //_ui.elements.cardNotVisitedStatLabel.innerHTML = " (" + (AppData.cards.length - visited) + " / " + AppData.cards.length + ")";
    _ui.elements.cardVisitedStatLabel.innerHTML = " (" + visited + " / " + AppData.cards.length + ")";
    _ui.elements.cardEndOfArticleStatLabel.innerHTML = " (" +  AppData.numCardsStoryReadComplete() + " / " + AppData.cards.length + ")";
    _pieChart.render(_ui.elements.pieChartCanvas);
};

function updateInteractionsCanvas(){
    _lineChart.render(_ui.elements.lineChartCanvas, AppData.interactionsHistory);
};

//=========================================
//================::BADGES LIST::===============
//=========================================

var _badgeRendererBgIndex = 0;
function getBadgeRenderer(message, progressNormal){
    var bgColor = appConfig.colorPalette[_badgeRendererBgIndex];
    _badgeRendererBgIndex++;
    _badgeRendererBgIndex %= appConfig.colorPalette.length;
    var bg = '<div class="badgeRendererBg" style="width:100%;" ></div>';
    bg += '<div class="badgeRendererBg" style="width:' + Math.round(progressNormal * 100) + "%; background-color:" + bgColor + ';" ></div>';
    var label = "<p>" + message + (progressNormal==1 ? "!" : "") + "</p>";

    //**************************
    //***TODO: awful hack, set opacity of renderers only during intro.
    //****************************

    var opacity = _introComplete ? 1 : 0;

    return '<div class="badgeRenderer" style="height:100%; opacity: ' + opacity + ';">' + (bg + label) + "</div>";
};

function getOpenedEnoughCardsRenderer(){
    return getBadgeRenderer("Opened 3 Cards", AppData.getStatsOpenedEnoughCardsNormal());
};
function getReadEnoughArticlesRenderer(){
    return getBadgeRenderer("Reached end of 2 Articles", AppData.getStatsReadEnoughArticlesNormal());
};
//needs to be updated frequently until minute has passed...
function getSpentEnoughTimeRenderer(){
    return getBadgeRenderer("Spent over 1 min on site", AppData.getStatsSpentEnoughTimeNormal());
};
function getOpenedAllCardsRenderer(){
    return getBadgeRenderer("Open ALL THE Cards", AppData.getStatsOpenedAllCardsNormal());
};
function clickedShareRenderer(){
    return getBadgeRenderer("Clicked the Share Button", AppData.getStatsClickEnoughShareButtonsNormal());
};
function getEnoughInteractionsRenderer(){
    return getBadgeRenderer("At least 30 Clicks", AppData.getStatsEnoughInteractionsNormal());
};

var _avatarContext, _avatarX, _avatarY, _avatarScale;

function updateAchievementsTitle(progressNormal){
    var value = progressNormal==1 ? "COMPLETE!" : "Achievements: " + Math.floor(progressNormal * 100) + "%";
    _ui.elements.achievementsTitle.innerHTML = value;
};

function updateBadges(){
    _badgeRendererBgIndex = 0;
    var listHtml = "";
    listHtml += getOpenedEnoughCardsRenderer();
    listHtml += getReadEnoughArticlesRenderer();
    listHtml += getSpentEnoughTimeRenderer();
    listHtml += getOpenedAllCardsRenderer();
    listHtml += clickedShareRenderer();
    listHtml += getEnoughInteractionsRenderer();
    _ui.elements.badgesList.innerHTML = listHtml;

    //MOVE TO Avatar()
    _avatarContext = _ui.elements.avatarCanvas.getContext("2d");
    _avatarContext.clearRect(0, 0, _ui.elements.avatarCanvas.width, _ui.elements.avatarCanvas.height);
    _avatarScale = Math.floor(Math.min(_ui.elements.avatarCanvas.width, _ui.elements.avatarCanvas.height) / PixelGuyHeadSprite.unscaledWidth);
    _avatarX = Math.floor(_ui.elements.avatarCanvas.width * .5 - PixelGuyHeadSprite.unscaledWidth * _avatarScale * .5);
    _avatarY = Math.floor(_ui.elements.avatarCanvas.height * .5 - PixelGuyHeadSprite.unscaledHeight * _avatarScale * .5);
    var progressNormal = AppData.getAchievementNormal();
    updateAchievementsTitle(progressNormal);
    PixelGuyHeadSprite.renderAvatar(_avatarContext, _avatarX, _avatarY, _avatarScale, progressNormal);
    checkCelebrate(progressNormal);
    _badgeIntroItemIndex = 0;
};

function checkCelebrate(normal){
    if(_introComplete && normal==1){
        _celebrateTimeoutId = setTimeout(celebrateVictory, 300);
    }
};

var _badgesIntroTimeoutId = -1;
var _badgeIntroItemIndex = 0;
function showNextAchievement(){
    var total = _ui.elements.badgesList.childNodes.length;
    var normal = AppData.getAchievementNormal() * _badgeIntroItemIndex;
    //console.log("showNextAchievement() ", _badgeIntroItemIndex, total);
    if(_badgeIntroItemIndex == total){
        _introComplete = true;
        //console.log("showNextAchievement() complete : ", _badgeIntroItemIndex, total);
        PixelGuyHeadSprite.renderAvatar(_avatarContext, _avatarX, _avatarY, _avatarScale, AppData.getAchievementNormal());
        if(_showCoseButtonCallback){
            _showCoseButtonCallback(true);
        }
        document.body.style.overflowY = "auto";
        document.body.style.overflowX = "hidden";
        checkCelebrate(normal);
        return;
    }
    _ui.elements.badgesList.childNodes[_badgeIntroItemIndex].style.opacity = 1;
    PixelGuyHeadSprite.renderAvatar(_avatarContext, _avatarX, _avatarY, _avatarScale, normal);
    _badgesIntroTimeoutId = setTimeout(showNextAchievement, 300);//make sure dom has been updated with new list
    _badgeIntroItemIndex++;
};


var _celebrateTimeoutId = -1;

//=========================================
//================::LAYOUT::===============
//=========================================

//Calls to _menu redraw are limited, as it's an expensive operation.
var _windowResizeTimeoutId = -1;
var windowResizeHandler = function () {
    clearTimeout(_windowResizeTimeoutId);
    _windowResizeTimeoutId = setTimeout(commitWindowResize, 300);//arbitrary number
};

//I know, this is old school, hard to read, but I got frustrated with css and flex box so...
var commitWindowResize = function () {
    updateLayout();
    updateWidgets();
};

var updateLayout = function () {
    _ui.elements.appContainer.style.opacity = 1;
    AppLayout.updateLayout(window.innerWidth, window.innerHeight);
    _windowResizeTimeoutId = -1;
    //console.log("commitWindowResize() ", AppLayout.bounds.toString());
    _appWidth = _maxAppWidth;
    _appHeight = Math.round(_maxAppWidth * .9);
    if(AppLayout.bounds.width > _maxAppWidth && AppLayout.bounds.height > _appHeight){
        //APP IS RENDERED AT _maxAppWidth * _maxAppWidth
        _ui.elements.appContainer.style.width =  _appWidth + "px";
        _ui.elements.appContainer.style.height = _appHeight + "px";
        _ui.elements.appContainer.style.top = Math.round(AppLayout.bounds.centerY() - _appHeight * .5) + "px";

        absPositionContainer(_ui.elements.interactionsContainer,   0, 0, .47, .27);
        absPositionContainer(_ui.elements.pieContainer,            0, .3, .47, .7 );
        //absPositionContainer(_ui.elements.badgesContainer,      .51, .08, panelWidth,    .82);
        //absPositionContainer(_ui.elements.shareContainer,       .02,  .92,  .96,   .06);
        absPositionContainer(_ui.elements.badgesContainer,         .515, 0, .47,   .87);
        absPositionContainer(_ui.elements.shareContainer,          .515, .9, .47,    .1);

        _ui.elements.appContainer.style.left = Math.round(AppLayout.bounds.centerX() - _appWidth * .5) + "px";
        _ui.elements.shareContainer.style.setProperty("margin-bottom", "0px");
        positionSharePanel(_appWidth);

    }else if(AppLayout.bounds.width > _maxAppWidth * .5) {
        //APP IS RENDERED AS VERTICAL LIST, CENTERED
        _appWidth = Math.round(_maxAppWidth * .5);
        _ui.elements.appContainer.style.width = _appWidth + "px";
        _ui.elements.appContainer.style.top = _ui.elements.appContainer.style.left = "0px";
        setVLayoutContainerPositions(_appWidth);
        _ui.elements.appContainer.style.left = Math.round(AppLayout.bounds.centerX() - _maxAppWidth * .25) + "px";
        positionSharePanel(AppLayout.bounds.width * .9);
    }else{
        _appWidth = AppLayout.bounds.width;
        //APP IS RENDERED AS VERTICAL LIST, FULL SCREEN WIDTH
        _ui.elements.appContainer.style.left = "0px";
        _ui.elements.appContainer.style.width = _appWidth + "px";
        setVLayoutContainerPositions(_appWidth);
        positionSharePanel(AppLayout.bounds.width * .95);
    }

    _ui.elements.lineChartCanvas.width = _ui.elements.interactionsContainer.offsetWidth;
    _ui.elements.lineChartCanvas.height = Math.round(_ui.elements.interactionsContainer.offsetHeight * .65);

    _ui.elements.avatarCanvas.style.position = "absolute";

    _ui.elements.avatarCanvas.width = _ui.elements.avatarCanvas.height = Math.floor(_ui.elements.badgesContainer.offsetWidth * .22);
    _ui.elements.avatarCanvas.style.top = "10px";
    _ui.elements.avatarCanvas.style.right = "10px";

    var context = _ui.elements.avatarCanvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;

    _ui.elements.pieChartCanvas.width = _ui.elements.pieChartCanvas.height = Math.floor(_ui.elements.pieChartContainer.offsetWidth * .75);
    _ui.elements.pieChartCanvas.style.marginLeft = Math.floor(_ui.elements.pieChartContainer.offsetWidth * .125) + "px";

    _ui.elements.badgesContainer.style.transform = "translate( 0px , 0px) scale(1)";
};

function positionSharePanel(width){
    var sharePanelHeight = Math.floor(AppLayout.bounds.height * .9);
    _ui.elements.sharePanel.style.width = width + "px";
    _ui.elements.sharePanel.style.height = sharePanelHeight + "px";
    _ui.elements.sharePanel.style.left = Math.round(AppLayout.bounds.centerX() - width * .5) + "px";
    _ui.elements.sharePanel.style.top = Math.round(AppLayout.bounds.centerY() - sharePanelHeight * .5) + "px";
    _ui.elements.sharePanel.style.backgroundColor = appConfig.themeColor;
}

function absPositionContainer(container, xNormal, yNormal, widthNormal, heightNormal){
    container.style.setProperty("position", "absolute");
    container.style.setProperty("left", Math.round(xNormal * _maxAppWidth) + "px");
    container.style.setProperty("top", Math.round(yNormal * _appHeight) + "px");
    container.style.setProperty("width", Math.round(widthNormal * _maxAppWidth) + "px");
    container.style.setProperty("height", Math.round(heightNormal * _appHeight) + "px");
};

function setVLayoutContainerPositions(appWidth){
    var containers = [_ui.elements.interactionsContainer, _ui.elements.pieContainer, _ui.elements.badgesContainer, _ui.elements.shareContainer];
    var i, container;
    for(i=0; i<containers.length; i++){
        container = containers[i];
        container.style.setProperty("position", "static");
        container.style.setProperty("width", appWidth + "px");
    }
    _ui.elements.interactionsContainer.style.setProperty("height", Math.round(appWidth * .4) + "px");
    _ui.elements.pieContainer.style.setProperty("height", Math.round(appWidth * 1.2) + "px");
    _ui.elements.badgesContainer.style.setProperty("height", Math.round(appWidth * 1.4) + "px");
    _ui.elements.shareContainer.style.setProperty("height", Math.round(appWidth * .08) + "px");
    _ui.elements.shareContainer.style.setProperty("margin-bottom", Math.round(appWidth * .2) + "px");

}

//=========================================
//================::ACTIONS::===============
//=========================================

function shareClickHandler(){
    document.body.style.overflow = "hidden";
    _ui.elements.appContainer.style.opacity = .1;
    _ui.elements.sharePanel.style.display = "block";
    if(_ui.elements.sharePanel.offsetHeight < 500){
        //temporary hack befre statsModule Refactor
        var listItems = _ui.elements.sharePanel.getElementsByTagName("li");
        for(var i=2; i<listItems.length; i++){
            listItems[i].style.display = "none";
        }
    }
    _unitAnimator.start(400, shareAppearUpdate, null, UnitEasing.easeOutSine);
    if(_showCoseButtonCallback){
        _showCoseButtonCallback(false);
    }
};

function shareAppearUpdate(normal){
    _ui.elements.sharePanel.style.transform = "translate( " + AppLayout.bounds.width * (1-normal) + "px ,0px)";
};

function shareDisappearUpdate(normal){
    _ui.elements.sharePanel.style.transform = "translate( " + (-AppLayout.bounds.width * normal) + "px ,0px)";
};

function sharePanelCloseHandler(){
    if(_showCoseButtonCallback){
        _showCoseButtonCallback(true);
    }
    tagShare();
    _unitAnimator.start(400, shareDisappearUpdate, shareDisappearComplete, UnitEasing.easeOutSine);
};

function shareDisappearComplete(){
    document.body.style.overflow = "auto";
    _ui.elements.appContainer.style.opacity = 1;
    _ui.elements.sharePanel.style.display = "none";
    if(!AppData.shareClick){
        AppData.shareClick = true;
        updateBadges();
    }
}

function bodyClickHandler(){
    if(!_introComplete || isCelebrating()){
        return;
    }
    AppData.storeInteraction();
    updateInteractionsCanvas();
    updateBadges();
};

function addOpenCard(){
    for(var i=0; i<AppData.cards.length; i++){
        if(!AppData.cards[i].visited){
            AppData.cards[i].visited = true;
            break;
        }
    }
    updatePieChartCanvas();
    updateBadges();
};
function addReachedEndOfArticle(){
    for(var i=0; i<AppData.cards.length; i++){
        if(!AppData.cards[i].storyReadComplete){
            AppData.cards[i].storyReadComplete = true;
            break;
        }
    }
    updatePieChartCanvas();
    updateBadges();
};
function addToVisitDurationMS(addMS){
    AppData.setVisitStart(AppData.msSinceStart + addMS);
    updateBadges();
};

function addActions(numActions){
    if(!isCelebrating()){
        AppData.userInteractions += numActions;
        updateBadges();
    }
};


//=========================================
//================::CELEBRATIONS::===============
//=========================================

var _confetti,
    _celebrateCanvas,
    _celebrateContext,
    _confettiCanvas,
    _bowdownBounds = new Rectangle(),
    _bowdownScale,
    _buttrockBounds = new Rectangle(),
    _buttrockScale;

//this is shite, fix it!!!
function isCelebrating(){
    return  _badgesContainerDance!=null || (_celebrateCanvas && _celebrateCanvas.display == "block");
};

var _toCelebratePanelRotations = 0;
var _badgesContainerDance;
function celebrateVictory(){
    scrollToStats();
    updateAchievementsTitle(1);
    _badgesContainerDance = {};
    _badgesContainerDance.toRadian = MathUtil.PI2 * 2.25;
    _badgesContainerDance.toRadius = 70;
    _unitAnimator.start(2500, updateCelebrateBadgesRotate, startConfetti);
    if(_showCoseButtonCallback){
        _showCoseButtonCallback(false);
    }
};

function updateCelebrateBadgesRotate(normal){
    var radius = normal * _badgesContainerDance.toRadius;
    _badgesContainerDance.radian = normal * _badgesContainerDance.toRadian;
    var x = Math.cos(_badgesContainerDance.radian) * radius;
    var y = Math.sin(_badgesContainerDance.radian) * radius;
    var scale = 1 + y/_badgesContainerDance.toRadius * .3;
    _ui.elements.badgesContainer.style.transform = "translate( " + x + "px , " + y + "px) scale(" + scale + ")";
};

function startConfetti(){
    _badgesContainerDance = undefined;
    _ui.elements.badgesContainer.style.transform = "translate( 0px , 0px) scale(1)";
    _ui.elements.appContainer.style.opacity = 0.1;
    document.body.style.overflow = "hidden";
    if(!_celebrateCanvas){
        _celebrateCanvas = document.createElement("canvas");
        _confettiCanvas = document.createElement("canvas");
        document.body.appendChild(_celebrateCanvas);

        var confettiCanvasSize = 60;
        _confettiCanvas.width = _confettiCanvas.height = confettiCanvasSize;

        var colors = appConfig.colorPalette.slice();
        colors.push("#FFFFFF", "#000000");
        _confetti = new PixelConfetti(colors, 1500, 4000, updateConfettiCallback);
    }
    _celebrateCanvas.style.display = "block";

    _celebrateCanvas.width = _celebrateCanvas.height = AppLayout.bounds.smallerSide();
    _celebrateCanvas.style.position = "fixed";
    _celebrateCanvas.style.left = Math.floor(AppLayout.bounds.centerX() - _celebrateCanvas.width * .5) + "px";
    _celebrateCanvas.style.top = Math.floor(AppLayout.bounds.centerY() - _celebrateCanvas.height * .5) + "px";
    _celebrateContext = _celebrateCanvas.getContext("2d");
    _celebrateContext.imageSmoothingEnabled = false;
    _celebrateContext.mozImageSmoothingEnabled = false;
    _celebrateContext.webkitImageSmoothingEnabled = false;
    _celebrateContext.msImageSmoothingEnabled = false;

    _bowdownScale = Math.floor(_celebrateCanvas.width * .8 / BowdownManager.unscaledWidth);
    _bowdownBounds.width = BowdownManager.unscaledWidth * _bowdownScale;
    _bowdownBounds.height = BowdownManager.unscaledHeight * _bowdownScale;
    _bowdownBounds.x = Math.round(_celebrateCanvas.width * .5 - _bowdownBounds.width * .5);
    _bowdownBounds.y = Math.round(_celebrateCanvas.height * .5 - _bowdownBounds.height * .5);

    _buttrockScale = Math.floor(_celebrateCanvas.width * .6 / ButtrockManager.unscaledWidth);
    _buttrockBounds.width = ButtrockManager.unscaledWidth * _buttrockScale;
    _buttrockBounds.height = ButtrockManager.unscaledHeight * _buttrockScale;
    _buttrockBounds.x = Math.round(_celebrateCanvas.width * .65 - _buttrockBounds.width * .5);
    _buttrockBounds.y = Math.round(_celebrateCanvas.height * .5 - _buttrockBounds.height * .5);

    BowdownManager.completeCallback = celebrateBowdownCompleteCallback;
    ButtrockManager.completeCallback = celebrateButtrockManagerCompleteCallback;
    _celBowCount = _celButCount = 0;

    _confetti.updateCanvas(_confettiCanvas);
    _confettiIntervalId = setInterval(addConfetti, 200 + Math.floor(Math.random() * 400));

    _celebrateContext.fillStyle = "#000000";//appConfig.themeColor;
    _celebrateContext.font = "bold " + Math.round(_bowdownBounds.height * .2) + "px Helvetica,Arial,sans-serif";
    _celebrateContext.textBaseline = "top";//top, bottom, middle, alphabetic, hanging
    _celebrateContext.textAlign = "center";

    tagCelebrate();
};

var _celBowCount = 0, _celButCount = 0;
function celebrateBowdownCompleteCallback(){
    _celBowCount++;
};
function celebrateButtrockManagerCompleteCallback(){
    _celButCount++;
};

function updateConfettiCallback(){
    _celebrateContext.clearRect(0,0,_celebrateCanvas.width, _celebrateCanvas.height);
    if(_celBowCount < 2){
        BowdownManager.render(_celebrateContext, _bowdownBounds.x, _bowdownBounds.y, _bowdownScale, .1);
    }else{
        ButtrockManager.render(_celebrateContext, _buttrockBounds.x, _buttrockBounds.y, _buttrockScale, .2);
        if(_celButCount > 15){
            if(_celebrateCompleteCallback){
                _celebrateCompleteCallback();
            }

            //------------------------------------ HACK, REFACTOR : to enable sharing after celebrations
            AppData.shareClick = false;
            stopCelebrations();
            return;
        }
        _celebrateContext.fillText("YOU ROCK!", _bowdownBounds.centerX() , _buttrockBounds.bottom());
    }

    _celebrateContext.drawImage(_confettiCanvas, 0, 0, _confettiCanvas.width, _confettiCanvas.height,
        0, 0, _celebrateCanvas.width, _celebrateCanvas.height);
};

var _confettiIntervalId = -1;
function addConfetti(event){
    var emitterX = Math.round(_confettiCanvas.width * .5);
    var emitterY = Math.round(_confettiCanvas.height * .4);
    _confetti.addParticles(55, emitterX, emitterY);
};

function stopCelebrations(){
    //console.log("stopCelebrations()");
    clearInterval(_confettiIntervalId);
    _confettiIntervalId = -1;
    if(_celebrateCanvas){
        _confetti.stop();
        _celebrateCanvas.style.display = "none";
    }
};




//*********************************************
//**********::GOOGLE ANALYTICS EVENTS::********
//*********************************************

var tagCelebrate = function(){
    if (gtag) {
        //gtag('event', 'showSection', {'event_category': appName + ":" + data.title.substr(0, 20)});
        gtag('event', 'celebrateStatsModule', {'event_category' : "statsModuleComplete"});
    }
};

var tagShare = function(){
    if (gtag) {
        //gtag('event', 'showSection', {'event_category': appName + ":" + data.title.substr(0, 20)});
        gtag('event', 'shareStatsModule', {'event_category' : "statsModuleShare"});
    }
};