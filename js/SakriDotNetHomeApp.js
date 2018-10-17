(function() {

    window.SakriDotNetHomeApp = function (appName, backButtonURL) {

        //Public API

        this.init = function () {
            GoogleAnalyticsService.appName = appName;//@appName is currently only used for analytics
            TangleUI.setLayoutDefinitions(SakriDotNetLayout);
            TransitionStore.setTransitionDefinitions(SakriDotNetTransitions);
            AppLayout.updateLayout(document.documentElement.clientWidth, document.documentElement.clientHeight);
            SakriDotNetSpriteSheet.init();
            AppData.startInteractionsHistory(10000, 6);
            _loader = AppConfig.loopLoader ? new SakriDotNetLoaderTestController() : new SakriDotNetLoaderController(loadCompleteHandler);
            _loader.start(AppData.getLoaderLabel(appName));
            TangleUI.setWindowResizeCallbacks(resizeStartHandler, resize);
            console.log("App.init()", AppData.msSinceStart(), "ms since script start");
        };

        //Private properties and methods

        var _loader,
            _menu,
            _cardCanvasRenderer = new CardCanvasRenderer(),
            _cardHtmlRenderer = new CardHtmlRenderer(),
            _closeButton, _navigationButton,
            _menuButton, _statsModuleLoader;

        var loadCompleteHandler = function(){
            _loader = null;
            console.log("App.load complete() ", AppData.msSinceStart() , "ms since script start");

            document.addEventListener('keyup', keyPressHandler);
            document.body.addEventListener("wheel", mouseWheelHandler, false);

            AppData.cards = HomeSectionsDataParser.parseSectionsData();

            _menu = new CardsMenu(document.body, AppConfig.zIndexLoaderCanvas, cardsScrollUpdate, showCard);

            //only index.html contains Stats Module.
            //todo : ideally there would be a subclass of HomeApp, HomeAppWithStats() or so.
            if(!backButtonURL){
                AppData.updateFromVisitStatsUrlParam(AppConfig.visitStats);//manage "visit progress" between apps.
                _menuButton = new MenuButton(showStatsModule);
                _statsModuleLoader = new StatsModuleLoader();
                _statsModuleLoader.load();
            }else{
                _menuButton = {};
                _menuButton.start = _menuButton.end = _menuButton.stop = _menuButton.addToPulse = function(){};
            }
            resize();
        };

        //move to _cardCanvasRenderer
        var renderCardsCanvasAssets = function () {
            var i, cardData, showReadMore, lastIndex = AppData.cards.length - 1;
            for (i = 0; i < AppData.cards.length; i++){
                cardData = AppData.cards[i];
                cardData.contentLayout.updateLayout();
                showReadMore = i === lastIndex;//only card on top needs this (never visible for others)
                _cardCanvasRenderer.createCardCanvasAssets(cardData, showReadMore);
            }
            _menu.setData(AppData.cards);
        };

        //--------- Window resize (responsive) ---------------

        var resizeStartHandler = function () {
            if(_loader){
                return;
            }

            _cardHtmlRenderer.close();
            _menu.resize(TangleUI.getRect());
            _menuButton.stop();
            if(_closeButton){
                _closeButton.stop();
            }
            if(_navigationButton){
                _navigationButton.stop();
            }
            hideStatsModule();
        };

        var resize = function () {
            var bounds = TangleUI.getRect();
            AppLayout.updateLayout(bounds.width, bounds.height);
            if(_loader){
                _loader.resize();
                return;
            }
            _menu.resize(bounds);
            _menu.show(true);
            renderCardsCanvasAssets();
            setTimeout(showMenuButton, 400);//TODO: remove timeout (delay in anim), or at least keep id and clearTimeout()
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
                    closeCard();
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

        //--------- BUTTONS ---------------

        var showMenuButton = function(){
            _menuButton.start(AppData.getPromptMessagesFunction());
        };

        var showNavigationButton = function(value){
            if(!backButtonURL){
                return;
            }
            _navigationButton = _navigationButton || new TabButton();
            if(value){
                _navigationButton.init("home", document.body, AppConfig.zIndexNavigationButton);
                _navigationButton.show(400, navigationButtonClickHandler);
                return;
            }
            _navigationButton.hide();
        };

        var navigationButtonClickHandler = function(){
            window.location = backButtonURL + (AppConfig.visitStats ? "?visitStats=" + AppConfig.visitStats : "");
        };

        var showCloseButton = function(value, callback){
            _closeButton = _closeButton || new TabButton();
            if(value){
                _closeButton.init("X", document.body, AppConfig.zIndexCloseButton, true);
                _closeButton.show(400, callback);
                return;
            }
            _closeButton.hide();
        };

        //--------- Card HTML rendering ---------------

        var showCard = function (index) {
            var data = AppData.cards[index];
            GoogleAnalyticsService.tagShowCardEvent(data);
            showNavigationButton(false);
            showCloseButton(true, closeCard);
            _menuButton.end();//should this be hideMenuButton()?
            _cardHtmlRenderer.open(data);
        };

        var closeCard = function(){
            AppData.storeInteraction();
            _cardHtmlRenderer.close();
            _menu.deselectCard();
            showCloseButton(false);
            showMenuButton();
            showNavigationButton(true);
        };

        //--------- Stats Module ---------------

        var showStatsModule = function(){
            _statsModuleLoader.show(document.body, closeStatsModule);
            _menu.show(false);
        };

        //called by close button and when celebration is complete
        var closeStatsModule = function(){
            hideStatsModule();
            showMenuButton();
            showNavigationButton(true);
            _menu.show(true);//TODO: Should animate drop again?
        };

        //TODO: revisit, this is called when resize() and from closeStatsModule()
        //Stats Module should handle resize on its own.
        var hideStatsModule = function(){
            if(AppData.statsVisited){
                _statsModuleLoader.stop();
            }
        };


    }
}());