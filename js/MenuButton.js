/**
 * DEPENDENCIES:
 * MathUtil, Rectangle, TanglUI, Transition, sprites, DonutChart, SpeechBubble
 */

(function() {

    window.MenuButton = function(showStatsModuleCallback) {

        //PUBLIC API

        this.start = function(getMessageFunction){
            _getMessageFunction = getMessageFunction || function(){
                return "sakri.net to stats button";
            };
            //console.log("MenuButton.start()");
            resize();
            _donut = _donut || new DonutChart("#FFFFFF", AppConfig.themeColor, "#222222");
            _progressNormal = AppData.getAchievementNormal();
            renderWithPie(0, TangleUI.getRect("progressGraphic"));
            animateButtonIn();
        };

        this.end = function(){
            hideSpeechBubble();
            stopIdleTimer();
            animateButtonOut();
        };

        this.stop = function(){
            stop();
        };

        //TODO: currently only called when scrolling menu. May need review
        this.addToPulse = function(){
            stopPromptSequence();
            incrementPulse();
            renderWithPie(0, TangleUI.getRect("progressGraphic"));
            startIdleTimer();
        };

        //PRIVATE PROPERTIES & METHODS

        var  _donut,  _canvas, _context, _speechBubble,  _progressNormal = 0, _pulseNormal = 0, _getMessageFunction,
            _avatarScale, _bgRipple = new ToStatsButtonBackground(), _avatarBounds = new Rectangle(), _animations = {};

        showStatsModuleCallback =  showStatsModuleCallback || function(){};

        var incrementPulse = function(){
            _pulseNormal += .02;
            _pulseNormal -= _pulseNormal > 1 ? 1 : 0;
        };

        var menuButtonClickHandler = function(){
            AppData.storeInteraction();
            playToStatsViewAnimation();
        };

        var stop = function(){
            stopIdleTimer();
            if(_animations.promptSequence){
                _animations.promptSequence.stop();
            }
            hideSpeechBubble();
            if(_canvas){
                _canvas.style.display = "none";
            };
        };

        //======================================================
        //==============:: Layout ::============================
        //======================================================

        //no public setLayoutBounds() method, when app resizes this.start() is called
        var resize = function(){
            //console.log("MenuButton.setLayoutBounds()", width, height);
            var bounds = TangleUI.getRect("menuButton");
            resizeCanvas(bounds.width, bounds.height);//Also initializes bg colors, refactor
            calculateDynamicLayout();
            _bgRipple.init(_canvas, new Rectangle(0, 0,_canvas.width, _canvas.height), AppConfig.themeColor, "#FFFFFF");
        };

        var calculateDynamicLayout = function(){
            //set progress graphic bounds proportional to bitmap
            var bounds = TangleUI.getRect("progressGraphic");
            var ss = SakriDotNetSpriteSheet.getSpriteSheetData("head");
            _avatarScale = Math.floor(bounds.height / ss.height);
            var adjustedBounds = new Rectangle(bounds.x, bounds.y);
            adjustedBounds.width = adjustedBounds.height = _avatarScale * ss.height;
            //console.log("calculateDynamicLayout()", bounds.toString(), adjustedBounds.toString());
            TangleUI.setRect(adjustedBounds, "progressGraphic", "default");

            //needed for "to stats module" animation
            bounds = TangleUI.getRect("progressGraphic", "transitionFrom");
            _avatarBounds.update(bounds.x, adjustedBounds.y, adjustedBounds.width, adjustedBounds.height);

            //adjust speech bubble layout and transition
            var menuBounds = TangleUI.getRect("menuButton");
            adjustedBounds.height = menuBounds.height * .5;
            adjustedBounds.width = Math.min(TangleUI.getRect().width * .8, 600);//TODO: hardcoded number, needs better approach
            adjustedBounds.x = TangleUI.getRect().width * .05;
            adjustedBounds.y = menuBounds.y - adjustedBounds.height * .45;
            TangleUI.setRect(adjustedBounds, "speechBubble", "default");
        };

        var _resizeBounds = new Rectangle();
        var resizeCanvas = function(width, height){
            if(!_canvas){
                _canvas = CanvasUtil.createCanvas(document.body, AppConfig.zIndexSpeechBubble);
                _canvas.addEventListener("click", menuButtonClickHandler);
                _canvas.style.position = "fixed";
            }
            _canvas.style.display = "block";
            _resizeBounds.update(TangleUI.getRect().right() - width, TangleUI.getRect().bottom() - height, width, height);
            _context = CanvasUtil.setLayoutBounds(_canvas, _resizeBounds);
            CanvasUtil.enablePixelArtScaling(_context);
        };

        //======================================================
        //==============:: Render ::=======================
        //======================================================

        //Normal param is needed as these are used as animation update callbacks

        var renderWithPie = function(normal, bounds){
            incrementPulse();
            _bgRipple.render(_pulseNormal, true);
            _donut.render(_canvas, bounds, _progressNormal);
        };

        var renderWithPixelGuy = function(normal, bounds){
            incrementPulse();
            _bgRipple.render(_pulseNormal, true);
            _avatarBounds.updateToRect(bounds);
            PixelGuyHeadSprite.renderAvatar(_context, _avatarBounds.x, _avatarBounds.y, _avatarScale, _progressNormal);
        };

        var updateTransitionMenuButton = function(normal, rect){
            var bounds = TangleUI.getRect("menuButton");
            TransitionCSSUtil.setTranslate(_canvas, rect.x - bounds.x, rect.y - bounds.y);
        };

        //TODO: move to Animation.js (css target or so)
        var renderAnimatingSpeechBubble = function(normal, rect){
            renderWithPixelGuy(0, TangleUI.getRect("progressGraphic"));
            var x = rect.x - _speechBubbleBounds.x;
            TransitionCSSUtil.setTranslate(_speechBubble, x, 0);
        };

        //Bit too much code required to dynamically update a transition...
        var _speechBubbleBounds = new Rectangle();
        var setNextSpeechBubble = function(){
            _speechBubble = _speechBubble || SpeechBubble.createSpeechBubble(document.body, AppConfig.zIndexSpeechBubble);//TODO hardcoded doc.body: should be  a parent arg
            _speechBubble.style.display = "block";
            _speechBubbleBounds.updateToRect(TangleUI.getRect("speechBubble"));
            _speechBubbleBounds.width = SpeechBubble.update(_speechBubble, _getMessageFunction(_progressNormal), _speechBubbleBounds);
            _speechBubbleBounds.x = Math.round(TangleUI.getRect().width * 1.1);
            //TangleUI.setRect(_speechBubbleBounds, "speechBubble", "transitionFrom");
            _speechBubble.style.transform = "translate(" + _speechBubbleBounds.width * 2 + "px, 0px)";//get it off screen
            var spacer = TangleUI.getRect("progressGraphic").width * .5;
            _speechBubbleBounds.x = Math.round(TangleUI.getRect().width - spacer - _speechBubbleBounds.width);
            TangleUI.setRect(_speechBubbleBounds, "speechBubble", "transitionTo");
            //_speechBubbleBounds = TangleUI.getRect("speechBubble");
            _speechBubble.style.left = _speechBubbleBounds.x + "px";
            _speechBubble.style.top = _speechBubbleBounds.y + "px";
        };

        var hideSpeechBubble = function(){
            if(_speechBubble){
                _speechBubble.style.display = "none";
            }
        };

        //======================================================
        //==============:: IDLE MANAGER::=======================
        //======================================================

        var _idleTimerId = -1, _idleDuration = 4000;
        var startIdleTimer = function(){
            stopIdleTimer();
            _idleTimerId = setTimeout(playPromptSequence, _idleDuration);
        };
        var stopIdleTimer = function(){
            clearTimeout(_idleTimerId);
            _idleTimerId = -1;
        };

        //======================================================
        //==============:: ANIMATIONS::==============
        //======================================================

        //only one element is translated at any given moment.

        var animateButtonIn = function(){
            _animations.button = AnimationStore.getTangleUIAnimation("menuButton", "menuButtonIn", updateTransitionMenuButton, startIdleTimer);
            _animations.button.play();
        };
        var animateButtonOut = function(){
            _animations.button = AnimationStore.getTangleUIAnimation("menuButton", "menuButtonIn", updateTransitionMenuButton, stop);
            _animations.button.playReverse();
        };

        var playPromptSequence = function(){
            setNextSpeechBubble();
            //TODO: should be able to recycle prompt1 and 2 for prompt6 and 7, also bubbleIn/out playReverse?
            var animations = [
                AnimationStore.getTangleUIAnimation("prompt1", "progressButtonOut", renderWithPie),
                AnimationStore.getTangleUIAnimation("prompt2", "progressButtonIn", renderWithPixelGuy),
                AnimationStore.getTangleUIAnimation("prompt3", "speechBubbleIn", renderAnimatingSpeechBubble),
                AnimationStore.getTangleUIAnimation("prompt4", "speechBubbleHover", renderAnimatingSpeechBubble),
                AnimationStore.getTangleUIAnimation("prompt5", "speechBubbleOut", renderAnimatingSpeechBubble),
                AnimationStore.getTangleUIAnimation("prompt6", "progressButtonOut", renderWithPixelGuy),
                AnimationStore.getTangleUIAnimation("prompt7", "progressButtonIn", renderWithPie)
            ];
            _animations.promptSequence = AnimationStore.getChainedAnimation("promptSequence", animations, null, startIdleTimer);
            _animations.promptSequence.play();
        };

        var stopPromptSequence = function(){
            if(_animations.promptSequence){
                _animations.promptSequence.stop();
            }
            hideSpeechBubble();
        };

        //--------TO STATS MODULE IN/OUT---------

        var playToStatsViewAnimation = function(){
            if(_animations.toStatsSequence && _animations.toStatsSequence.isAnimating()){
                console.log("MenuButton.playToStatsViewAnimation() transition active, skipping");
                return;//already transitioning
            }
            resizeCanvas(TangleUI.getRect().width, TangleUI.getRect().height);
            _canvas.style.left = _canvas.style.top = "0px";
            _bgRipple.init(_canvas, TangleUI.getRect("menuButton"), AppConfig.themeColor, "#FFFFFF");
            stopIdleTimer();
            hideSpeechBubble();

            //set dynamic start position
            var bounds = TangleUI.getRect("menuButton");
            _avatarBounds.update(_avatarBounds.x + bounds.x, _avatarBounds.y + bounds.y, _avatarBounds.width, _avatarBounds.height);
            TangleUI.setRect(_avatarBounds, "menuButtonAvatarCenter", "transitionFrom");

            var animations = [
                AnimationStore.getTangleUIAnimation("toStats1", "pixelGuyToStatsModule1", null, showStatsModuleCallback),
                AnimationStore.getTangleUIAnimation("toStats2", "pixelGuyToStatsModule2", null)
            ];
            _animations.toStatsSequence = AnimationStore.getChainedAnimation("toStatsSequence", animations, renderToStatsAnimation, stop);
            _animations.toStatsSequence.play();
        };

        var renderToStatsAnimation = function(normal, bounds){
            _context.fillStyle = AppConfig.appBgColor;
            _context.fillRect(0,0,_canvas.width, _canvas.height);
            incrementPulse();//consider moving into render()
            _bgRipple.render(_pulseNormal);
            var scale = bounds.width / (PixelGuyHeadSprite.unscaledWidth - 1);//shadow screws up centering otherwise
            PixelGuyHeadSprite.renderAvatar(_context, bounds.x, bounds.y, scale, _progressNormal);
        };

    }
}());