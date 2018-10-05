(function() {

    window.StatsModuleLoader = function(){

        //Public API

        this.load = function(){
            if(_statsSource){
                console.log("StatsModuleLoader.load() stats mod already loaded");
                return;
            }
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (req.readyState !== 4 || req.status !== 200){
                    return;
                }
                _statsSource = req.responseText;
                console.log("stats module loaded");
            };
            req.open("GET", "./statsModule.html");
            req.send();
        };

        this.show = function(parent, openShareCallback, closeCallback){
            if(!_statsSource){
                console.log("App.showStatsModule() warning : module not loaded");
                return;
            }
            if(!_iFrame){
                _iFrame = document.createElement("iframe");
                _iFrame.style.position = "absolute";
                _iFrame.style.width = "100%";
                _iFrame.style.height = "100%";
                _iFrame.style.position = "absolute";
                _iFrame.style.margin = "0px";
                _iFrame.style.zoom = "1";
                _iFrame.style.padding = "0px";
                _iFrame.style.borderWidth = "0px";
                parent.appendChild(_iFrame);
                _iFrame.contentWindow.document.open();
                _iFrame.contentWindow.document.write(_statsSource);
                _iFrame.contentWindow.isEmbedded = true;
                _iFrame.contentWindow.document.close();
                _iFrame.onload = function() {
                    //console.log("statsModule.onload()");
                    _iFrame.style.visibility = "visible";
                    _iFrame.contentWindow.initFromApp(AppData, SakriDotNetSpriteSheet, GoogleAnalyticsService.isLive() ? gtag : null, openShareCallback,  closeCallback);
                    _iFrame.contentWindow.showStats();
                };
                _iFrame.style.visibility = "hidden";
            }else{
                _iFrame.style.display = "block";
                _iFrame.contentWindow.updateWidgets();//should not be called from here?
                _iFrame.contentWindow.showStats(AppData.getAchievementNormal() === 1);
            }
            GoogleAnalyticsService.tagShowStatsModule();
            AppData.statsVisited = true;
            this.resize();
        };

        this.resize = function(){
            _iFrame.style.width = TangleUI.getRect().width + "px";
            _iFrame.style.height = TangleUI.getRect().height + "px";
            //TODO: currently resize closes Stats Module, shouldn't happen
        };

        this.stop = function(){
            _iFrame.contentWindow.stopCelebrations();//rename to something more general like :  stop()
            _iFrame.style.display = "none";
        };


        //private properties and methods

        var _statsSource, _iFrame;
    }

}());