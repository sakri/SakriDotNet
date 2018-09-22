(function() {

    //@appName is currently only used for analytics
    window.SakriDotNetHomeApp = function (appName, backButtonURL) {

        //private properties
        var _menuContainer,
            _menuCanvas,
            _menu,
            _cardCanvasRenderer,
            _cardHtmlRenderer = new CardHtmlRenderer(),
            _menuButton;


        //*****************************
        //**********::PUBLIC API::*****
        //*****************************

        //TODO: consider renaming to ? startLoader? start()?
        this.init = function () {
            AppLayout.updateLayout(document.documentElement.clientWidth, document.documentElement.clientHeight);
            SakriDotNetSpriteSheet.init();
            AppData.startInteractionsHistory(10000, 6);
            _cardCanvasRenderer = new CardCanvasRenderer(storyReadCompleteHandler);
            var _loader = appConfig.loopLoader ? new SakriDotNetLoaderTestController() : new SakriDotNetLoaderController(loadCompleteHandler);
            _loader.start();
            console.log("App.init()", AppData.msSinceStart(), "ms since script start");
        };

        //************************
        //**********::LOGIC::*****
        //************************

        function loadCompleteHandler(){
            console.log("App.load complete() ", AppData.msSinceStart() , "ms since script start");

            window.addEventListener("resize", windowResizeHandler);
            document.addEventListener('keyup', keyPressHandler);
            document.body.addEventListener("wheel", mouseWheelHandler, false);

            AppData.cards = parseSectionsData();
            document.body.innerHTML = "";

            _menuContainer = document.createElement("div");
            _menuContainer.classList.add("canvasContainer");
            document.body.appendChild(_menuContainer);
            _menuCanvas = createCanvas();
            _menuContainer.appendChild(_menuCanvas);
            _menu = new CardsMenu(_menuCanvas, cardsScrollUpdate, showCardHandler);
            //MenuButton shouldn't be included in apps that don't show it, so if(window.MenuButton)
            if(!backButtonURL){
                _menuButton = new MenuButton(showStatsModule, backButtonURL);
            }else{
                _menuButton = {};//todo : find better solution, this is a placeholder to avoid errors
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

        var createCanvas = function (width, height) {
            var canvas = document.createElement("canvas");
            canvas.style.position = "absolute";
            canvas.style.top = "0px";
            canvas.style.left = "0px";
            //console.log("App.createCanvas() : ", canvas.width, canvas.height);
            return canvas;
        };

        //must occur in separate frames due to getDataUrl(), also renderTitleImage() must happen prior to renderTabImage()
        var renderCardsCanvasAssets = function () {
            var i, cardData, showReadMore;
            for (i = 0; i < AppData.cards.length; i++){
                cardData = AppData.cards[i];
                cardData.contentLayout.updateLayout();
                showReadMore = i == AppData.cards.length - 1;//only card on top needs this (never visible for others)
                _cardCanvasRenderer.createCardCanvasAssets(cardData, showReadMore);
            }

            // via url to faq.html & portfolio.html, but not edited. The data is then passed back to index.html
            //if naviating via the "home" button.
            if(!backButtonURL && appConfig.visitStats){
                AppData.updateFromVisitStatsUrlParam(appConfig.visitStats);
                appConfig.visitStats = undefined;//this blocks the stats from being reset on resize
            }

            _menu.setData(AppData.cards);
            //TODO: nasty hack. Stats module is only available in index.html, the progress is passed
            loadStatsModule();
        };

        //************************************************
        //**********::WINDOW RESIZE : responsive::********
        //************************************************

        //Calls to _menu redraw are limited, as it's an expensive operation.
        var _windowResizeTimeoutId = -1;
        var windowResizeHandler = function () {
            //TODO: should disable menu interactions
            clearTimeout(_windowResizeTimeoutId);
            _cardHtmlRenderer.forceClose();
            _menuCanvas.height = _menuCanvas.width = 0;//clear canvas
            _windowResizeTimeoutId = setTimeout(commitWindowResize, 300);//arbitrary number
        };

        var commitWindowResize = function () {
            AppData.storeInteraction();
            hideIframe();
            _menuCanvas.width = _menuContainer.offsetWidth;
            _menuCanvas.height = _menuContainer.offsetHeight;
            AppLayout.updateLayout(_menuCanvas.width, _menuCanvas.height);
            _windowResizeTimeoutId = -1;

            console.log("App.commitResize()", AppLayout.bounds.toString());
            CardMenuLayout.updateLayout(_menuCanvas.width, _menuCanvas.height);
            renderCardsCanvasAssets();
            setTimeout(showNavigationButtons, 700, true);
            setTimeout(_menuButton.start.bind(_menuButton), 400);
        };

        //*****************************************
        //**********::USER INTERACTION::********
        //*****************************************

        var keyPressHandler = function(event){
            _cardHtmlRenderer.isOpen() ? keyPressCardOpenHandler(event.keyCode) : keyPressCardsMenu(event.keyCode);
        }

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
        //**********::STATS MODULE::********
        //*********************************************

        //addStat( click, open card, article read, timeSpent
        //prompt
        //show button, button states
        //open

        var _statsSource;
        var loadStatsModule = function(){
            if(_statsSource){
                console.log("App.loadStatsModule() stats mod already loaded");
                return;
            }
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (req.readyState != 4 || req.status != 200){
                    return;
                }
                _statsSource = req.responseText;
                console.log("stats mod loaded");
            };
            req.onerror = function(){
                console.log("stats mod load ERROR");
            }
            req.open("GET", "./statsModule.html");
            req.send();
        };

        var _statsModule;
        var showStatsModule = function(){
            if(!_statsSource){
                console.log("App.showStatsModule() warning : module not loaded");
                return;
            }
            console.log("App.showStatsModule()");
            _menuContainer.style.display = "none";
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
                    _statsModule.contentWindow.initFromApp(AppData, SakriDotNetSpriteSheet, isLive() ? gtag : null, showStatsShareCallback,  celebrateStatsCompleteHandler);
                    _statsModule.contentWindow.showStats();
                };
                _statsModule.style.visibility = "hidden";
            }else{
                _statsModule.style.display = "block";
                _statsModule.contentWindow.updateWidgets();//should not be called from here?
                _statsModule.contentWindow.showStats(AppData.getAchievementNormal() == 1);
            }
            //TODO: watch out for resize calls?
            _statsModule.style.width = AppLayout.bounds.width + "px";
            _statsModule.style.height = AppLayout.bounds.height + "px";
        };

        //TODO: refactor, very awkward...
        var _closeIframeButton;
        function showStatsShareCallback(showCloseStatsButton){
            if (!_closeIframeButton) {
                _closeIframeButton = new TabButton(closeIframeButtonClickHandler, appConfig.closeStatsButtonZ);
            }
            resizeCloseStatsModuleButton();
            _closeIframeButton.show(showCloseStatsButton);
        };

        function resizeCloseStatsModuleButton(){
            var buttonHeight = (AppLayout.headerBounds.height * .7);//calculate every time for resizing
            var buttonWidth = Math.round(buttonHeight * 2.4);
            if(AppLayout.bounds.isPortrait()){
                buttonHeight = (AppLayout.bounds.width / 10);//calculate every time for resizing
                buttonWidth = Math.round(buttonHeight * 2.6);
            }
            var button = _closeIframeButton.init("X", buttonWidth, buttonHeight, 1.1, (AppLayout.bounds.width - buttonWidth * 1.25) / AppLayout.bounds.width);
            button.style.position = "fixed";
        };

        var celebrateStatsCompleteHandler = function(){
            _menuButton.missionAccomplished();
            closeIframeButtonClickHandler();
        };

        var closeIframeButtonClickHandler = function(){
            hideIframe();
            _menuButton.start();
        };

        var hideIframe = function(){
            if(!_statsModule){
                return;
            }
            _statsModule.contentWindow.stopCelebrations();
            _statsModule.style.display = "none";
            _closeIframeButton.show(false);
            _menuContainer.style.display = "block";
        }

        var menuButtonClickHandler = function(){
            if(backButtonURL){
                var params = "";
                if(appConfig.visitStats){
                    params = "?visitStats=" + appConfig.visitStats;
                }
                window.location = backButtonURL + params;
            }
        };

        //*********************************************
        //**********::GOOGLE ANALYTICS EVENTS::********
        //*********************************************

        var isLive = function(){
            return location.href.indexOf("localhost") == -1 && gtag;
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
            _menuButton.start();
            setTimeout(showNavigationButtons, 700, true);//TODO: store intervalId and stop if?? resize??
        };
    }
}());