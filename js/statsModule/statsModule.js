/**
 *
 * This is still a mess, I intend to use Parcel.js, but wanted to release this version before setting
 * up all the js files as modules.
 * There are some poor practices in terms of vue.js, still learning ;)
 *
 */

(function() {

    window.TemplateGrabber = {};

    TemplateGrabber.grabTemplateFromDom = function(id){
        var element = document.getElementById(id);
        if(!element){
            console.warn("TemplateGrabber.grabTemplateFromDom(", id, ") , warning : no element found");
            return false;
        }
        _templates[id] = element.outerHTML;
        element.parentElement.removeChild(element);
        return true;
    };

    TemplateGrabber.getTemplate = function(id){
        if(!_templates[id] && !this.grabTemplateFromDom(id)){
            console.warn("TemplateGrabber.getTemplate(", id, ") , warning : no template found");
            _templates[id] = '<div ref="id"></div>';
        }
        return _templates[id];
    };

    var _templates = {};

}());

//grabs "sharePanel" from dom when "requested", returns component object parsed by vue
//Probably not the intended vue.js way of doing things, done as a test (TODO: remove)
var getSharePanel = function(){
    return {
        props: [],
        data: function () {
            return {
                quotes:[],
                quoteIndex:0
            }
        },
        template : TemplateGrabber.getTemplate("sharePanelTemplate"),
        mounted : function(){
            this.$refs.sharePanelTemplate.style.position = "absolute";
            this.$refs.sharePanelTemplate.style.visibility = "visible";
            this.$refs.sharePanelTemplate.style.display = "none";
            this.$refs.sharePanelTemplate.style.backgroundColor = AppConfig.themeColor;
            this.$refs.sharePanelCloseButton.style.color = AppConfig.themeColor;
            var listItems = this.$refs.sharePanelExamplesContainer.getElementsByTagName("li");
            for(var i=0; i< listItems.length; i++){
                this.quotes.push(listItems[i].innerHTML);
            }
            var mitchQuotes = AppData.getMitchHedbergQuotes();
            for(i=0; i< mitchQuotes.length; i++){
                this.quotes.push(mitchQuotes[i] + " - M. Hedberg");
            }
            this.$refs.sharePanelExamplesContainer.innerHTML = "";
            this.$refs.sharePanelAvatar.render(.4);
            this.showQuote();
            this.quoteIndex++;
        },
        methods : {
            showPanel : function(){
                var panel = this.$refs.sharePanelTemplate;
                var panelRect = TangleUI.getRect("sharePanel");
                //var windowRect = TangleUI.getRect("window");
                //fromRect.x =
                //TangleUI.setRect(fromRect, "sharePanel", "transitionFrom");
                TransitionCSSUtil.showElement(panel, TangleUI.getRect("sharePanel"));
                DomElementTransitionAnimationStore.playTangleUIAnimation("sharePanel","sharePanelIn", panel);
            },
            hidePanel : function(){
                AppData.shareClick = true;
                var panel = this.$refs.sharePanelTemplate;
                TransitionCSSUtil.showElement(panel, TangleUI.getRect("sharePanel", "transitionTo"));
                DomElementTransitionAnimationStore.playTangleUIAnimation("sharePanel","sharePanelOut", panel, this.$root.hideShare);
            },
            updateLayout : function(){

            },
            showQuote : function(){
                var quote = this.quotes[this.quoteIndex % this.quotes.length];
                this.$refs.sharePanelExamplesContainer.style.fontSize = Math.round(TangleUI.getRect("sharePanelExamplesContainer").height / 5.3) + "px";
                this.$refs.sharePanelExamplesContainer.innerHTML = '"' + quote + '"';
            },
            nextQuote : function(){
                this.showQuote();//animate in and out
                //this.$refs.sharePanelExamplesContainer.innerHTML = '<span class="sharePanelExamplesQuote">"</span>' + quote + '<span class="sharePanelExamplesQuote">"</span>';
                this.quoteIndex++;
                this.$root.tagShareQuote();
            },
            stop : function(){
                TransitionCSSUtil.showElement(this.$refs.sharePanelTemplate);
            }
        }
    };
};

//this sucks, way too much code for something so simple
var _closeButtonInstanceCount = 0;
var getCloseButton = function(label, rightAlign){
    var _id = "statsModCloseButton" + (_closeButtonInstanceCount++),
        _defaultRect = new Rectangle(0, -1, 0, 45), _fromRect = new Rectangle(0, -1, 0, 45),
        _animation,
        _inData = {duration:300, easing:UnitEasing.easeOutSine},
        _outData = {duration:300, easing:UnitEasing.easeInSine};
    //console.log("getCloseButton() instance count : ", _closeButtonInstanceCount, label, rightAlign);
    return {
        props: [],
        data: function () {
            return {}
        },
        template: '<button ref="closeButton" class="closeButton" v-on:click.stop="clickHandler">' + label + '</button>',
        mounted : function(){
            this.show();
        },
        methods:{
            show : function(){
                this.calculateLayout();
                var transition = TransitionStore.getTransition(_id, _fromRect, _defaultRect, _inData);
                _animation = AnimationStore.getAnimation(_id, transition);
                var button = this.$refs.closeButton;
                TransitionCSSUtil.showElement(button, _defaultRect);
                DomElementTransitionAnimationStore.playAnimation(_id, _animation, button);
            },
            hide : function(){
                var transition = TransitionStore.getTransition(_id, _defaultRect, _fromRect, _outData);
                _animation = AnimationStore.getAnimation(_id, transition);
                var button = this.$refs.closeButton;
                TransitionCSSUtil.showElement(button, _fromRect);
                DomElementTransitionAnimationStore.playAnimation(_id, _animation, button);
            },
            resize : function(){
                if(!_animation){
                    return;
                }
                if(_animation.getFromRectangle().equals(_fromRect)){
                    this.show();
                }
            },
            clickHandler : function(){
                this.$root.closeStatsModule();
            },
            stop : function(){
                _animation.stop();
                TransitionCSSUtil.showElement(this.$refs.closeButton);
            },
            calculateLayout : function(){
                var fontSize = Math.round(_defaultRect.height * .6);
                _defaultRect.width = _fromRect.width = HtmlUtil.measureTextWidth(label, fontSize, document.body) + _defaultRect.height * 2;
                //console.log("TabButton.calculateLayout()", fontSize, _defaultRect.width);
                var spacer = TangleUI.getRect().smallerSide() * .05;

                //not the most flexible solution, ok for now.
                if(rightAlign){
                    _defaultRect.x = Math.round(TangleUI.getRect().right() - spacer - _defaultRect.width);
                    _fromRect.x = Math.round(TangleUI.getRect("window").width * 1.05);
                }else{
                    _defaultRect.x = spacer;
                    _fromRect.x = Math.round(_defaultRect.width * -.1);
                }
                var button = this.$refs.closeButton;
                var borderRadius = Math.round(_defaultRect.height * .95);
                button.style.borderRadius = "0px 0px " + borderRadius + "px " + borderRadius + "px";
                button.style.fontSize = fontSize + "px";
                button.innerHTML = label;
            }
        }
    };
};

Vue.component('clicks-chart', {
    props: [],
    data: function () {
        return {
            lineChart: new LineChart("#f7f7f7")
        }
    },
    template: '<canvas ref="clicksCanvas" class="TangleUIelem"></canvas>',
    methods:{
        render : function(){
            this.lineChart.render(this.$refs.clicksCanvas, AppData.interactionsHistory);
        }
    }
});

Vue.component('visits-pie-chart', {
    props: [],
    data: function () {
        return {
            pieChart: new PieChart("#f7f7f7")
        }
    },
    template: '<canvas ref="pieCanvas" class="TangleUIelem"></canvas>',
    methods:{
        render : function(){
            this.pieChart.render(this.$refs.pieCanvas);
        }
    }
});

Vue.component('avatar-renderer', {
    props: ["id"],
    data: function () {
        return {}
    },
    template: '<canvas ref="avatarCanvas" class="TangleUIelem"></canvas>',
    methods:{
        render : function(progressNormal){
            var canvas = this.$refs.avatarCanvas, bounds = TangleUI.getRect(this.id);
            CanvasUtil.enablePixelArtScaling(CanvasUtil.setLayoutBounds(canvas, bounds));
            //console.log(this.id, "avatar render : ", canvas.width, canvas.height, bounds.width, bounds.height);
            var scale = Math.floor(Math.min(bounds.width / PixelGuyHeadSprite.unscaledWidth, bounds.height/ PixelGuyHeadSprite.unscaledHeight) );
            var x = bounds.width * .5 - (scale * PixelGuyHeadSprite.unscaledWidth * .5);
            PixelGuyHeadSprite.renderAvatar(canvas.getContext("2d"), Math.floor(x), 0, scale, progressNormal);
        },
        clear : function(){
            var canvas = this.$refs.avatarCanvas;
            var context = canvas.getContext("2d");
            context.clearRect(0,0,canvas.width, canvas.height);
        }
    }
});

Vue.component('badge-list-renderer', {
    props: [],
    data: function () {
        return {
            barsList: new ProgressBarList(this.$root.playCelebrate)
        }
    },
    template: '<canvas ref="badgesCanvas" class="TangleUIelem"></canvas>',
    methods:{
        render : function(data){
            this.barsList.update(this.$refs.badgesCanvas, TangleUI.getRect("badgesList"), data);
            if(this.barsList.dataComplete(data)){
                window.scrollTo(0, 0);//bit of a hack here...
            }
        }
    }
});

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

Vue.component('tangle-fit-text', {
    props: ["multiline", "minfontsize", "maxfontsize"],
    computed:{
        textFitProps : function(){
            var fitProps = undefined;//I don't want this instantiated every update?
            if(this.multiline){
                fitProps = fitProps || {};
                fitProps.multiLine = this.multiline
            }
            if(this.minfontsize){
                fitProps = fitProps || {};
                fitProps.minFontSize = this.minfontsize
            }
            if(this.maxfontsize){
                fitProps = fitProps || {};
                fitProps.maxFontSize = this.maxfontsize
            }
            return fitProps;
        }
    },
    mounted : function(){
        this.render();
    },
    template: '<div ref="fitTextContainer" class="TangleUIelem"><slot></slot></div>',
    methods:{
        render : function(){
            var container = this.$refs.fitTextContainer;
            //container.innerHTML = this.label;
            var rect = container.id == "" ? null :  TangleUI.getRect(container.id);
            //console.log("render text id : ", container.id, rect.toString(), this.textFitProps);
            TransitionCSSUtil.showElement(container, rect);
            textFit(container, this.textFitProps);
            /*
            settings = {
alignVert: false, // if true, textFit will align vertically using css tables
alignHoriz: false, // if true, textFit will set text-align: center
multiLine: false, // if true, textFit will not set white-space: no-wrap
detectMultiLine: true, // disable to turn off automatic multi-line sensing
minFontSize: 6,
maxFontSize: 80,
reProcess: true, // if true, textFit will re-process already-fit nodes. Set to 'false' for better performance
widthOnly: false, // if true, textFit will fit text to element width, regardless of text height
alignVertWithFlexbox: false, // if true, textFit will use flexbox for vertical alignment
};
            */
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
};

//TODO: move to events?
var initFromApp = function(data, sprites, closeModuleCallback){
    //override with data from home page, if inside iframe. A bit slightly very hackish... :D
    console.log("StatsModule.initFromApp()");
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
            resize : function(){
                TransitionCSSUtil.showElement(this.$refs.appContainer, TangleUI.getRect());
                this.setOverflows();
                var clicksTitleBounds = TangleUI.getRect("clicksTitle");
                var titleFontSize = Math.round(clicksTitleBounds.height * .5);
                this.updatePanelTitle(this.$refs.clicksTitle, titleFontSize, TangleUI.getRect("clicksTitle"));
                this.updatePanelTitle(this.$refs.visitsTitle, titleFontSize,  TangleUI.getRect("visitsTitle"));
                this.updatePanelTitle(this.$refs.badgesTitle, titleFontSize,  TangleUI.getRect("badgesTitle"));
                this.$refs.closeButton.resize();
                this.$refs.shareButton.style.backgroundColor = AppConfig.themeColor;
                if(standalone){
                    this.$refs.testControllers.style.position = TangleUI.getRect().isPortrait() ? "fixed" : "absolute";
                }
                this.update();
            },
            update : function(){
                var progressNormal = AppData.getAchievementNormal();
                //console.log("app.update()", ++this.updateCount);
                app.clicksTitle = "Clicks History";
                app.visitsTitle = "Cards overview";
                app.badgesTitle = "Achievements: " + Math.round(progressNormal * 100)+ "%";
                this.$refs.clicksHistoryChart.render();
                this.$refs.visitPieChart.render();
                this.$refs.badgesAvatar.render(progressNormal);
                this.updateBadgesData();
                this.$refs.badgesList.render(this.badgesData);
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
                    gtag('event', 'celebrateStatsModule', {'event_category' : "statsModuleComplete"});
                }
            },
            tagShare : function(){
                if (gtag) {
                    gtag('event', 'shareStatsModule', {'event_category' : "statsModuleShare"});
                }
            },
            tagShareQuote : function(){
                if (gtag) {
                    gtag('event', 'shareNextQuote', {'event_category' : "shareNextQuote"});
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