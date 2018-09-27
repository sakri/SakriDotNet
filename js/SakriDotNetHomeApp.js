(function() {

    //@appName is currently only used for analytics
    window.SakriDotNetHomeApp = function (appName, backButtonURL) {

        //private properties
        var _loader,
            _menuCanvas,//TODO move to Menu
            _menu,
            _cardCanvasRenderer,
            _cardHtmlRenderer = new CardHtmlRenderer(),
            _menuButton;


        //*****************************
        //**********::PUBLIC API::*****
        //*****************************

        this.init = function () {
            AppLayout.updateLayout(document.documentElement.clientWidth, document.documentElement.clientHeight);
            SakriDotNetSpriteSheet.init();
            AppData.backButtonURL = backButtonURL;
            AppData.startInteractionsHistory(10000, 6);
            _cardCanvasRenderer = new CardCanvasRenderer(storyReadCompleteHandler);
            _loader = appConfig.loopLoader ? new SakriDotNetLoaderTestController() : new SakriDotNetLoaderController(loadCompleteHandler);
            _loader.start();
            window.addEventListener("resize", windowResizeHandler);
            console.log("App.init()", AppData.msSinceStart(), "ms since script start");
        };

        //************************
        //**********::LOGIC::*****
        //************************

        var loadCompleteHandler = function(){
            _loader = null;
            console.log("App.load complete() ", AppData.msSinceStart() , "ms since script start");

            document.addEventListener('keyup', keyPressHandler);
            document.body.addEventListener("wheel", mouseWheelHandler, false);

            AppData.cards = parseSectionsData();
            document.body.innerHTML = "";

            _menuCanvas = CanvasUtil.createCanvas(document.body, appConfig.loaderCanvasZ);
            CanvasUtil.resize(_menuCanvas, AppLayout.bounds.width, AppLayout.bounds.height);
            _menuCanvas.style.left = _menuCanvas.style.top = "0px";

            _menu = new CardsMenu(_menuCanvas, cardsScrollUpdate, showCardHandler);

            //todo : ideally there would be a subclass of HomeApp, HomeAppWithStats() or so.
            //find better solution for placeholder (avoids errors)
            if(!AppData.showStatsModule()){
                _menuButton = new MenuButton(showStatsModule);
                loadStatsModule();
            }else{
                _menuButton = {};
                _menuButton.start = _menuButton.end = _menuButton.stop = _menuButton.addToPulse = function(){};
            }
            commitWindowResize();
        };

        var parseSectionsData = function () {
            var sectionNodes = document.body.querySelectorAll("section, article"),
                dataList = [], data, section, node, i, story, originalImage;
            for (i = 0; i < sectionNodes.length; i++) {
                section = sectionNodes[i];
                node = section.querySelector(".sectionContent");
                originalImage = node.querySelector("img");
                data = {};
                if (originalImage) {
                    data.image = new Image();
                    data.image.src = originalImage.src;
                }
                data.themeColor = appConfig.colorPalette[i % appConfig.colorPalette.length];
                data.title = node.querySelector("h1").innerHTML.toLowerCase();
                data.contentLayout = new CardContentLayout(
                    data.image ? data.image.width : AppLayout.thumbDefaultBounds.width,
                    data.image ? data.image.height : AppLayout.thumbDefaultBounds.height
                );
                data.headline = node.querySelector("p").innerHTML;
                story = section.querySelector(".sectionExtendedContent");
                data.story = story ? story.innerHTML : "";
                data.link = node.querySelector("a");
                data.visited = false;
                data.storyReadComplete = false;
                dataList[i] = data;
            }
            return dataList.reverse();//html order is displayed in inverse order in menu
        };

        //must occur in separate frames due to getDataUrl(), also renderTitleImage() must happen prior to renderTabImage()
        var renderCardsCanvasAssets = function () {
            var i, cardData, showReadMore;
            for (i = 0; i < AppData.cards.length; i++){
                cardData = AppData.cards[i];
                cardData.contentLayout.updateLayout();
                showReadMore = i === AppData.cards.length - 1;//only card on top needs this (never visible for others)
                _cardCanvasRenderer.createCardCanvasAssets(cardData, showReadMore);
            }

            // via url to faq.html & portfolio.html, but not edited. The data is then passed back to index.html
            //if naviating via the "home" button.
            if(!AppData.showStatsModule() && appConfig.visitStats){
                AppData.updateFromVisitStatsUrlParam(appConfig.visitStats);
                appConfig.visitStats = undefined;//this blocks the stats from being reset on resize
            }

            _menu.setData(AppData.cards);
        };

        //************************************************
        //**********::WINDOW RESIZE : responsive::********
        //************************************************

        //Calls to _menu redraw are limited, as it's an expensive operation.
        var _windowResizeTimeoutId = -1;
        var windowResizeHandler = function () {
            //TODO: should disable menu interactions
            clearTimeout(_windowResizeTimeoutId);
            if(!_loader){
                _cardHtmlRenderer.forceClose();
                _menuCanvas.height = _menuCanvas.width = 0;//clear canvas
            }
            _windowResizeTimeoutId = setTimeout(commitWindowResize, 300);//arbitrary number
        };

        var commitWindowResize = function () {
            AppLayout.updateLayout(document.documentElement.clientWidth, document.documentElement.clientHeight);
            AppData.storeInteraction();
            if(_loader){
                _loader.resize();
                return;
            }
            hideIframe();
            _windowResizeTimeoutId = -1;

            console.log("App.commitResize()", AppLayout.bounds.toString());
            _menuCanvas.width = AppLayout.bounds.width;
            _menuCanvas.height = AppLayout.bounds.height;
            CardMenuLayout.updateLayout(_menuCanvas.width, _menuCanvas.height);
            renderCardsCanvasAssets();
            setTimeout(showMenuButton, 400);
            setTimeout(showNavigationButtons, 700, true);
        };

        //*****************************************
        //**********::USER INTERACTION::********
        //*****************************************

        var keyPressHandler = function(event){
            _cardHtmlRenderer.isOpen() ? keyPressCardOpenHandler(event.keyCode) : keyPressCardsMenu(event.keyCode);
        };

        var keyPressCardOpenHandler = function (keyCode) {
            switch (keyCode) {
                case 8://backspace
                case 37://enter
                case 46://delete
                case 88://x
                    _cardHtmlRenderer.forceClose(true);
                    break;
            }
        };

        var keyPressCardsMenu = function (keyCode) {
            switch (keyCode) {
                case 13://enter
                    _menu.enterPressHandler();
                    break;
                case 38:
                case 39:
                    _menu.keyboardScrollHandler(-1);//up and left
                    break;
                case 37:
                case 40:
                    _menu.keyboardScrollHandler(1);//down and right
                    break;
            }
        };

        var mouseWheelHandler = function (event) {
            _menu.scrollWheelUpdate(event.deltaX, event.deltaY);
        };

        var cardsScrollUpdate = function(){
            _menuButton.addToPulse();
        };

        //*********************************************
        //**********::TO STATS MODULE BUTTON::********
        //*********************************************

        var showMenuButton = function(){
            _menuButton.start(appConfig.getPromptMessagesFunction(AppData.getAchievementNormal()));
        };

        //*********************************************
        //**********::STATS MODULE::********
        //*********************************************

        var _statsSource, _statsModule, _closeIframeButton;
        var loadStatsModule = function(){
            if(_statsSource){
                console.log("App.loadStatsModule() stats mod already loaded");
                return;
            }
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (req.readyState !== 4 || req.status !== 200){
                    return;
                }
                _statsSource = req.responseText;
                console.log("stats mod loaded");
            };
            req.open("GET", "./statsModule.html");
            req.send();
        };

        var showStatsModule = function(){
            if(!_statsSource){
                console.log("App.showStatsModule() warning : module not loaded");
                return;
            }
            AppData.statsVisited = true;
            _menuCanvas.style.display = "none";
            if(!_statsModule){
                _statsModule = document.createElement("iframe");
                _statsModule.style.position = "absolute";
                _statsModule.style.width = "100%";
                _statsModule.style.height = "100%";
                _statsModule.style.position = "absolute";
                _statsModule.style.margin = "0px";
                _statsModule.style.zoom = "1";
                _statsModule.style.padding = "0px";
                _statsModule.style.borderWidth = "0px";
                document.body.appendChild(_statsModule);
                _statsModule.contentWindow.document.open();
                _statsModule.contentWindow.document.write(_statsSource);
                _statsModule.contentWindow.isEmbedded = true;
                _statsModule.contentWindow.document.close();
                _statsModule.onload = function() {
                    console.log("_statsModule.onload()");
                    _statsModule.style.visibility = "visible";
                    _statsModule.contentWindow.initFromApp(AppData, SakriDotNetSpriteSheet, isLive() ? gtag : null, showStatsShareCallback,  closeIframeButtonClickHandler);
                    _statsModule.contentWindow.showStats();
                };
                _statsModule.style.visibility = "hidden";
            }else{
                _statsModule.style.display = "block";
                _statsModule.contentWindow.updateWidgets();//should not be called from here?
                _statsModule.contentWindow.showStats(AppData.getAchievementNormal() === 1);
            }
            //TODO: watch out for resize calls?
            _statsModule.style.width = AppLayout.bounds.width + "px";
            _statsModule.style.height = AppLayout.bounds.height + "px";
        };

        //TODO: refactor, very awkward...
        var showStatsShareCallback = function(showCloseStatsButton){
            _closeIframeButton = _closeIframeButton || new TabButton(closeIframeButtonClickHandler, appConfig.closeStatsButtonZ);
            resizeCloseStatsModuleButton();
            _closeIframeButton.show(showCloseStatsButton);
        };

        var resizeCloseStatsModuleButton = function(){
            var buttonHeight = (AppLayout.headerBounds.height * .7);//calculate every time for resizing
            var buttonWidth = Math.round(buttonHeight * 2.4);
            if(AppLayout.bounds.isPortrait()){
                buttonHeight = (AppLayout.bounds.width / 10);//calculate every time for resizing
                buttonWidth = Math.round(buttonHeight * 2.6);
            }
            var button = _closeIframeButton.init("X", buttonWidth, buttonHeight, 1.1, (AppLayout.bounds.width - buttonWidth * 1.25) / AppLayout.bounds.width);
            button.style.position = "fixed";
        };

        var closeIframeButtonClickHandler = function(){
            hideIframe();
            showMenuButton();
        };

        var hideIframe = function(){
            if(_statsModule){
                _statsModule.contentWindow.stopCelebrations();
                _statsModule.style.display = "none";
                _closeIframeButton.show(false);
                _menuCanvas.style.display = "block";
            }
        };

        var menuButtonClickHandler = function(){
            if(backButtonURL){
                window.location = backButtonURL + appConfig.visitStats ? "?visitStats=" + appConfig.visitStats : "";
            }
        };

        //*********************************************
        //**********::GOOGLE ANALYTICS EVENTS::********
        //*********************************************

        var isLive = function(){
            return location.href.indexOf("localhost") === -1 && gtag;
        };

        var tagShowCardEvent = function(data){
            if (isLive() && data.title) {
                //gtag('event', 'showSection', {'event_category': appName + ":" + data.title.substr(0, 20)});
                gtag('event', 'showCard', {'event_category': appName + "-" + data.title.substr(0, 20)});
            }
        };

        var storyReadCompleteHandler = function(data){
            if (isLive()) {
                gtag('event', 'cardReadComplete', {'event_category': appName + "-" + data.title.substr(0, 20)});
                data.storyReadComplete = true;
            }
        };

        //*****************************************
        //**********::CARD HTML RENDERING::********
        //*****************************************

        var showNavigationButtons = function(value){
            if(backButtonURL){
                _cardHtmlRenderer.showNavigationButton(value, menuButtonClickHandler);
            }
        };

        var showCardHandler = function (index) {
            var data = AppData.cards[index];
            data.visited = true;
            tagShowCardEvent(data);
            showNavigationButtons(false);
            _menuButton.end();
            _cardHtmlRenderer.renderCard(data, closeCardHandler);
        };

        var closeCardHandler = function () {
            _menu.deselectCard();
            showMenuButton();
            setTimeout(showNavigationButtons, 700, true);//TODO: store intervalId and stop if?? resize??
        };
    }
}());