/**
 *
 * This is still a mess, I intend to use Parcel.js, one step at a time.
 * There are some poor practices in terms of vue.js, still learning ;)
 *
 */

//TODO: pass to component, move to own file
var getCelebrationsAnimationColors = function(){
    var colors = AppConfig.colorPalette.slice();//TODO: move dependency out
    colors.push("#FFFFFF", "#000000");
    return colors;
};

Vue.component('celebrations-animation', {
    props: [],
    data: function () {
        return {
            celebrations: new CelebrationsAnimation(getCelebrationsAnimationColors(), this.$root.celebrateComplete)
        }
    },
    mounted : function(){
        this.$refs.celebrationsCanvas.style.display = "none";
    },
    template: '<canvas ref="celebrationsCanvas" class="TangleUIelem"></canvas>',
    methods:{
        play : function(avatarBounds, completeCallback){
            this.$refs.celebrationsCanvas.style.display = "block";
            this.celebrations.play(this.$refs.celebrationsCanvas, avatarBounds);
        },
        stop : function(){
            this.$refs.celebrationsCanvas.style.display = "none";
            this.celebrations.stop();
        }
    }
});



//Wire dom elements to TangleUI via id. In terms of "number of lines of code" these are great.
//But are also are called unnecessarily on every interaction. TODO:find be a more efficient solution
Vue.directive('tangle-layout', function (el) {
    //console.log("whee tangle-layout directive in effect!", el.id);
    TransitionCSSUtil.showElement(el, TangleUI.getRect(el.id));
});

Vue.directive('tangle-layout-canvas', function (el) {
    CanvasUtil.setLayoutBounds(el, TangleUI.getRect(el.id));
});

Vue.directive('tangle-layout-pixelartcanvas', function (el) {
    CanvasUtil.enablePixelArtScaling(
        CanvasUtil.setLayoutBounds(el, TangleUI.getRect(el.id))
    );
});

Vue.directive('tangle-layout-text', function (el, binding, vnode) {
    console.log("whee tangle-layout-text directive in effect!", el);
    var bounds = TangleUI.getRect(el.id);
    el.style.fontSize = Math.round(bounds.height * .8) + "px";
    TransitionCSSUtil.showElement(el, bounds);
    console.log(vnode);
});


var app;

var init = function(){
    console.log("StatsModule.init()");
    TangleUI.setLayoutDefinitions(StatsModuleTangUIRects, 1.1);
    TransitionStore.setTransitionDefinitions(StatsModuleTangleUITransitions);
    if(!window["isEmbedded"]){
        initStandalone();
    }
};

var initStandalone = function(){
    console.log("StatsModule.initStandalone()");
    AppData.setMockData();
    AppData.startInteractionsHistory(10000, 6);
    SakriDotNetSpriteSheet.init();
    initApp(true);
    TangleUI.setWindowResizeCallbacks(app.resizeStart, app.resize, 100);
    document.getElementById("testControllers").style.display = "block";
};

var initFromApp = function(config, data, sprites, closeModuleCallback){
    //override with objects from home page, if inside iframe. meh.
    console.log("StatsModule.initFromApp()");
    window.AppConfig = config;
    window.AppData = data;
    window.SakriDotNetSpriteSheet = sprites;
    initApp(false, closeModuleCallback);
};

var initApp = function(standalone, closeModuleCallback){
    app = new Vue({
        el: '#app',
        data: {
            standalone : standalone,
            badgesTitle : '',
            badgesData : [
                {label:"Opened 3 Cards", normal:0, color:AppConfig.getNextPaletteColor()},
                {label:"Reached end of 2 Articles", normal:0, color:AppConfig.getNextPaletteColor()},
                {label:"Spent over 1 min on site", normal:0, color:AppConfig.getNextPaletteColor()},
                {label:"Open ALL THE Cards", normal:0, color:AppConfig.getNextPaletteColor()},
                {label:"Clicked the Share Button", normal:0, color:AppConfig.getNextPaletteColor()},
                {label:"At least 30 Clicks", normal:0, color:AppConfig.getNextPaletteColor()}
            ],
            updateCount : 0
        },
        components: {
            'share-panel': getSharePanel(),
            'close-button': getCloseButton("X", true)
        },
        methods: {
            resizeStart : function(){
                this.$refs.appContainer.style.display = "none";
            },
            forceResize : function(width, height){
                if(this.standalone){
                    return;
                }
                //Very very hackish, I tried https://benmarshall.me/responsive-iframes/ but it showed me no love :(
                document.body.style.width = width + "px";
                document.body.style.height = height + "px";
                document.body.style.visibility = "hidden";
                requestAnimationFrame(this.forceResizeStep2);
            },
            forceResizeStep2 : function(width, height){
                TangleUI.forceResize();
                this.resize();
                document.body.style.visibility = "visible";
            },
            resize : function(){
                //console.log("StatsModule.app.resize()", TangleUI.getRect().toString());
                TransitionCSSUtil.showElement(this.$refs.appContainer, TangleUI.getRect());
                this.setOverflows();
                var clicksTitleBounds = TangleUI.getRect("clicksTitle");
                var titleFontSize = Math.round(clicksTitleBounds.height * .5);
                this.updatePanelTitle(this.$refs.clicksTitle, titleFontSize, TangleUI.getRect("clicksTitle"));
                this.updatePanelTitle(this.$refs.visitsTitle, titleFontSize,  TangleUI.getRect("visitsTitle"));
                this.updatePanelTitle(this.$refs.badgesTitle, titleFontSize,  TangleUI.getRect("badgesTitle"));
                this.$refs.closeButton.resize();
                this.$refs.shareButton.style.backgroundColor = AppConfig.themeColor;
                this.addClick();//data must be modified for directives to fire (TangleUI components need this)
            },
            update : function(){
                var progressNormal = AppData.getAchievementNormal();
                //console.log("app.update()", ++this.updateCount);
                app.clicksTitle = "Clicks History";
                app.visitsTitle = "Cards overview";
                app.badgesTitle = "Achievements: " + Math.round(progressNormal * 100)+ "%";
                this.$refs.badgesAvatar.render(progressNormal);
                this.updateBadgesData();
                this.$refs.badgesList.render(this.badgesData);
                this.$refs.sharePanel.updateLayout();
                requestAnimationFrame(this.updateComponents);
            },
            updateComponents : function(){
                //hack, to support tangle-layout directive, otherwise render happens before resize and charts are cleared
                this.$refs.clicksHistoryChart.render();
                this.$refs.visitPieChart.render(AppData.cards);

            },
            stop : function(){
                //console.log("app.stop()");
                this.$refs.sharePanel.stop();
            },
            updatePanelTitle : function(title, titleFontSize,  rect){
                title.style.fontSize = titleFontSize + "px";//TODO surely not best practice :D
                TransitionCSSUtil.showElement(title, rect);
            },
            updateBadgesData: function(){
                this.badgesData[0].normal =  AppData.getStatsOpenedEnoughCardsNormal();
                this.badgesData[1].normal =  AppData.getStatsReadEnoughArticlesNormal();
                this.badgesData[2].normal =  AppData.getStatsSpentEnoughTimeNormal();
                this.badgesData[3].normal =  AppData.getStatsOpenedAllCardsNormal();
                this.badgesData[4].normal =  AppData.getStatsClickEnoughShareButtonsNormal();
                this.badgesData[5].normal =  AppData.getStatsEnoughInteractionsNormal();
            },
            showShare : function(){
                document.body.style.overflow = "hidden";
                this.$refs.sharePanel.showPanel();
                this.$refs.closeButton.hide();
            },
            hideShare : function(){
                this.tagShare();
                this.update();
                this.$refs.closeButton.show();
                this.setOverflows();
            },
            playCelebrate : function(){
                document.body.style.overflow = "hidden";
                this.tagCelebrate();
                AppData.celebrated = true;
                var avatarRect = TangleUI.getRect("badgesAvatar");
                var badgesBounds = TangleUI.getRect("badgesContainer");
                var rect = new Rectangle(badgesBounds.x + avatarRect.x, badgesBounds.y + avatarRect.y, avatarRect.width, avatarRect.height);
                this.$refs.celebrationsAnimation.play(rect, this.celebrateComplete);
                this.$refs.clickHistoryContainer.style.opacity = 0.1;
                this.$refs.visitPieContainer.style.opacity = 0.1;
                this.$refs.badgesContainer.style.opacity = 0.1;
                this.$refs.badgesAvatar.clear();
            },
            celebrateComplete : function(){
                this.stopCelebration();
                if (closeModuleCallback){
                    closeModuleCallback();
                }
                if(standalone){
                    this.update();
                }
            },
            stopCelebration : function(){
                AppData.shareClick = false;
                this.$refs.celebrationsAnimation.stop();
                this.$refs.clickHistoryContainer.style.opacity = 1;
                this.$refs.visitPieContainer.style.opacity = 1;
                this.$refs.badgesContainer.style.opacity = 1;
                this.setOverflows();
            },
            closeStatsModule : function(){
                if(standalone){
                    window.location.href = "./index.html";
                }else{
                    if (closeModuleCallback){
                        closeModuleCallback();
                    }
                }
            },
            setOverflows : function(){
                document.body.style.overflowX = "hidden";
                var rect = null;
                if(TangleUI.getLayoutName() === "portrait"){
                    rect = TangleUI.getRect("verticalLayoutBottomHack");
                    document.body.style.overflowY = "auto";
                }else{
                    document.body.style.overflowY = "hidden";
                }
                TransitionCSSUtil.showElement(this.$refs.verticalLayoutBottomHack, rect);
            },
            addClick : function(){
                AppData.storeInteraction();
                this.update();
            },
            tagCelebrate : function(){
                if (gtag) {
                    gtag('event', 'celebrate', {'event_category' : "statsModule"});
                }
            },
            tagShare : function(){
                if (gtag) {
                    gtag('event', 'share', {'event_category' : "statsModule"});
                }
            },
            tagShareQuote : function(){
                if (gtag) {
                    gtag('event', 'shareNextQuote', {'event_category' : "statsModule"});
                }
            },


            /* TESTING, can be removed? Consider MockApp inherits from App?  */
            addMockCardVisit : function(){
                AppData.addMockCardVisit();
                AppData.storeInteraction();
                app.update();
            },
            addMockReachedEndOfArticle : function(){
                AppData.addMockReachedEndOfArticle();
                AppData.storeInteraction();
                app.update();
            },
            addMockToVisitDurationMS : function(addSeconds){
                AppData.addMockToVisitDurationMS(addSeconds * 1000);
                AppData.storeInteraction();
                app.update();//updateBadges()
            },
            addMockActions : function(numActions){
                AppData.addMockActions(numActions);
                app.update();
            },
            celebrateVictory : function(){
                AppData.completeMockVisit();
                app.update();
            }
        }
    });

    app.resize();//didn't really work from mounted() ?!
}