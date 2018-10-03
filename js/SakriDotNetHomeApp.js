(function() {

    //@appName is currently only used for analytics
    window.SakriDotNetHomeApp = function (appName, backButtonURL) {

        //Public API

        this.init = function () {
            TangleUI.setLayoutDefinitions(SakriDotNetLayout);
            TransitionStore.setTransitionDefinitions(SakriDotNetTransitions);
            TangleUI.setLayoutBounds(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
            AppLayout.updateLayout(document.documentElement.clientWidth, document.documentElement.clientHeight);
            SakriDotNetSpriteSheet.init();
            AppData.startInteractionsHistory(10000, 6);
            _loader = appConfig.loopLoader ? new SakriDotNetLoaderTestController() : new SakriDotNetLoaderController(loadCompleteHandler);
            _loader.start();
            window.addEventListener("resize", windowResizeHandler);
            console.log("App.init()", AppData.msSinceStart(), "ms since script start");
        };

        //Private properties and methods

        var _loader,
            _menuCanvas,//TODO move to Menu
            _menu,
            _cardCanvasRenderer = new CardCanvasRenderer(),
            _cardHtmlRenderer = new CardHtmlRenderer(),
            _menuButton, _closeButton, _navigationButton,
            _statsSource, _statsModule;

        var loadCompleteHandler = function(){
            _loader = null;
            console.log("App.load complete() ", AppData.msSinceStart() , "ms since script start");

            document.addEventListener('keyup', keyPressHandler);
            document.body.addEventListener("wheel", mouseWheelHandler, false);

            AppData.cards = parseSectionsData();
            document.body.innerHTML = "";

            _menuCanvas = CanvasUtil.createCanvas(document.body, appConfig.loaderCanvasZ);
            CanvasUtil.setLayoutBounds(_menuCanvas, TangleUI.bounds.width, TangleUI.bounds.height);
            _menuCanvas.style.left = _menuCanvas.style.top = "0px";

            _menu = new CardsMenu(_menuCanvas, cardsScrollUpdate, showCard);

            //only index.html contains Stats Module. This mechanism attempts to store/pass "visit progress" state between apps.
            if(!backButtonURL && appConfig.visitStats){
                AppData.updateFromVisitStatsUrlParam(appConfig.visitStats);
            }

            //todo : ideally there would be a subclass of HomeApp, HomeAppWithStats() or so.
            if(!backButtonURL){
                _menuButton = new MenuButton(showStatsModule);
                loadStatsModule();
            }else{
                _menuButton = {};
                _menuButton.start = _menuButton.end = _menuButton.stop = _menuButton.addToPulse = function(){};
            }
            commitWindowResize();
        };

        //TODO: move to data once TangleUI is implemented
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

        var renderCardsCanvasAssets = function () {
            var i, cardData, showReadMore;
            for (i = 0; i < AppData.cards.length; i++){
                cardData = AppData.cards[i];
                cardData.contentLayout.updateLayout();
                showReadMore = i === AppData.cards.length - 1;//only card on top needs this (never visible for others)
                _cardCanvasRenderer.createCardCanvasAssets(cardData, showReadMore);
            }
            _menu.setData(AppData.cards);
        };

        //--------- Window resize (responsive) ---------------

        //Avoids repeatedly running resize logic by calling commitWindowResize 300ms after last user resize action
        var _windowResizeTimeoutId = -1;
        var windowResizeHandler = function () {
            //TODO: should disable menu interactions
            clearTimeout(_windowResizeTimeoutId);
            if(!_loader){
                _cardHtmlRenderer.close();
                _menuCanvas.height = _menuCanvas.width = 0;//clear canvas
                _menuButton.stop();
                if(_closeButton){
                    _closeButton.stop();
                }
                if(_navigationButton){
                    _navigationButton.stop();
                }
            }
            _windowResizeTimeoutId = setTimeout(commitWindowResize, 300);//arbitrary number
        };

        var commitWindowResize = function () {
            TangleUI.setLayoutBounds(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
            AppLayout.updateLayout(document.documentElement.clientWidth, document.documentElement.clientHeight);
            if(_loader){
                _loader.resize();
                return;
            }
            hideIframe();
            _windowResizeTimeoutId = -1;
            //console.log("App.commitResize()", TangleUI.bounds.toString());
            _menuCanvas.width = TangleUI.bounds.width;
            _menuCanvas.height = TangleUI.bounds.height;
            CardMenuLayout.updateLayout(_menuCanvas.width, _menuCanvas.height);
            renderCardsCanvasAssets();
            setTimeout(showMenuButton, 400);
            setTimeout(showNavigationButton, 700, true);
        };

        //--------- User Interactions ---------------

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

        //--------- Stats Module --------------- (consider moving this code to a class)

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
                    _statsModule.contentWindow.initFromApp(AppData, SakriDotNetSpriteSheet, isLive() ? gtag : null, showStatsShareCallback,  closeIframe);
                    _statsModule.contentWindow.showStats();
                };
                _statsModule.style.visibility = "hidden";
            }else{
                _statsModule.style.display = "block";
                _statsModule.contentWindow.updateWidgets();//should not be called from here?
                _statsModule.contentWindow.showStats(AppData.getAchievementNormal() === 1);
            }
            //TODO: watch out for resize calls?
            _statsModule.style.width = TangleUI.bounds.width + "px";
            _statsModule.style.height = TangleUI.bounds.height + "px";
        };

        //TODO: refactor, bit awkward...
        var showStatsShareCallback = function(value){
            showCloseButton(value, closeIframe);
        };

        var closeIframe = function(){
            hideIframe();
            showMenuButton();
            showNavigationButton(true);
        };

        var hideIframe = function(){
            if(_statsModule){
                _statsModule.contentWindow.stopCelebrations();
                _statsModule.style.display = "none";
                showCloseButton(false);
                _menuCanvas.style.display = "block";
            }
        };


        //--------- Google Analytics (TODO: move to class) ---------------

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

        //--------- BUTTONS ---------------

        //"To Stats Module Button" will become "menu button" later
        var showMenuButton = function(){
            _menuButton.start(appConfig.getPromptMessagesFunction(AppData.getAchievementNormal()));
        };

        //TODO: currently a "home button", will become a menu button?
        var showNavigationButton = function(value){
            if(!backButtonURL){
                return;
            }
            _navigationButton = _navigationButton || new TabButton();
            if(value){
                _navigationButton.init("home", document.body, appConfig.navigationButtonZ);
                _navigationButton.show(400, navigationButtonClickHandler);
                return;
            }
            _navigationButton.hide();
        };

        var navigationButtonClickHandler = function(){
            window.location = backButtonURL + (appConfig.visitStats ? "?visitStats=" + appConfig.visitStats : "");
        };

        var showCloseButton = function(value, callback){
            _closeButton = _closeButton || new TabButton();
            if(value){
                _closeButton.init("X", document.body, appConfig.closeCardButtonZ, true);
                _closeButton.show(400, callback);
                return;
            }
            _closeButton.hide();
        };

        //--------- Card HTML rendering ---------------

        var showCard = function (index) {
            var data = AppData.cards[index];
            tagShowCardEvent(data);
            showNavigationButton(false);
            showCloseButton(true, closeCard);
            _menuButton.end();//should this be hideMenuButton()?
            _cardHtmlRenderer.open(data);
        };

        var closeCard = function(dispatchCallback){
            AppData.storeInteraction();
            _cardHtmlRenderer.close();
            _menu.deselectCard();
            showCloseButton(false);
            showMenuButton();
            showNavigationButton(true);
        };

    }
}());