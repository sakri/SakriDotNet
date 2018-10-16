(function() {

    //gtag is set in google script on html page

    window.GoogleAnalyticsService = {};

    //Public API

    GoogleAnalyticsService.isLive = function(){
        return location.href.indexOf("localhost") === -1 && gtag;
    };

    GoogleAnalyticsService.appName = "";

    GoogleAnalyticsService.tagShowCardEvent = function(data){
        if (this.isLive() && data.title) {
            //gtag('event', 'showSection', {'event_category': appName + ":" + data.title.substr(0, 20)});
            gtag('event', 'showCard', {'event_category': this.appName + "-" + data.title.substr(0, 20)});
        }
    };

    GoogleAnalyticsService.tagStoryReadCompleteHandler = function(data){
        if (this.isLive()) {
            gtag('event', 'cardReadComplete', {'event_category': this.appName + "-" + data.title.substr(0, 20)});
        }
    };

    GoogleAnalyticsService.tagShowStatsModule = function(){
        if (this.isLive()) {
            //gtag('event', 'showSection', {'event_category': appName + ":" + data.title.substr(0, 20)});
            gtag('event', 'showStatsModule', {'event_category' : "statsModule"});
        }
    };

    //private properties and methods


}());