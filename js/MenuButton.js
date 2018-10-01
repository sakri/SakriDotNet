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
            _donut = _donut || new DonutChart("#FFFFFF", appConfig.themeColor, "#222222");
            _progressNormal = AppData.getAchievementNormal();
            renderWithPie(TangleUI.getRect("progressGraphic"));
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
            renderWithPie(TangleUI.getRect("progressGraphic"));
            startIdleTimer();
        };

        //PRIVATE PROPERTIES & METHODS

        var  _donut,  _canvas, _context, _speechBubble,  _progressNormal = 0, _pulseNormal = 0, _getMessageFunction,
            _avatarScale, _bgRipple = new ToStatsButtonBackground(), _avatarBounds = new Rectangle(), _animations = {};

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
            _canvas.style.display = "none";
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
            _bgRipple.init(_canvas, new Rectangle(0, 0,_canvas.width, _canvas.height), appConfig.themeColor, "#FFFFFF");
        };

        var calculateDynamicLayout = function(){
            //set progress graphic bounds proportional to bitmap
            var bounds = TangleUI.getRect("progressGraphic");
            var ss = SakriDotNetSpriteSheet.getSpriteSheetData("head");
            _avatarScale = Math.floor(bounds.height / ss.height);
            var adjustedBounds = new Rectangle(bounds.x, bounds.y);
            adjustedBounds.width = adjustedBounds.height = _avatarScale * ss.height;
            //console.log("calculateDynamicLayout()", bounds.toString(), adjustedBounds.toString());
            TangleUI.setRect("progressGraphic", "default", adjustedBounds);

            //needed for "to stats module" animation
            bounds = TangleUI.getRect("progressGraphic", "transitionFrom");
            _avatarBounds.update(bounds.x, adjustedBounds.y, adjustedBounds.width, adjustedBounds.height);

            //adjust speech bubble layout and transition
            var menuBounds = TangleUI.getRect("menuButton");
            adjustedBounds.height = menuBounds.height * .5;
            adjustedBounds.width = Math.min(TangleUI.bounds.width * .8, 600);//TODO: hardcoded number, needs better approach
            adjustedBounds.x = TangleUI.bounds.width * .05;
            adjustedBounds.y = menuBounds.y - adjustedBounds.height * .45;
            TangleUI.setRect("speechBubble", "default", adjustedBounds);
        };

        var resizeCanvas = function(width, height){
            if(!_canvas){
                _canvas = CanvasUtil.createCanvas(document.body, appConfig.menuButtonPromptZ);
                _canvas.addEventListener("click", menuButtonClickHandler);
                _canvas.style.position = "fixed";
            }
            _canvas.style.display = "block";
            _canvas.style.left = TangleUI.bounds.right() - width + "px";
            _canvas.style.top = TangleUI.bounds.bottom() - height + "px";
            _context = CanvasUtil.setLayoutBounds(_canvas, width, height);
            CanvasUtil.enablePixelArtScaling(_context);
        };

        //======================================================
        //==============:: Render ::=======================
        //======================================================

        var renderWithPie = function(bounds){
            //console.log("renderWithPie()", bounds.toString());
            incrementPulse();
            _bgRipple.render(_pulseNormal);
            _donut.render(_canvas, bounds, _progressNormal);
        };

        var renderWithPixelGuy = function(bounds){
            incrementPulse();
            _bgRipple.render(_pulseNormal);
            _avatarBounds.updateToRect(bounds);
            PixelGuyHeadSprite.renderAvatar(_context, _avatarBounds.x, _avatarBounds.y, _avatarScale, _progressNormal);
        };

        var renderAnimatingPie = function(normal, rect){
            renderWithPie(rect);
        };

        var renderAnimatingPixelGuy = function(pixelGuy, rect){
            renderWithPixelGuy(rect);
        };

        var updateTransitionMenuButton = function(normal, rect){
            var bounds = TangleUI.getRect("menuButton");
            TransitionCSSUtil.setTranslate(_canvas, rect.x - bounds.x, rect.y - bounds.y);
        };

        var renderAnimatingSpeechBubble = function(){
            renderWithPixelGuy(TangleUI.getRect("progressGraphic"));
            var x = _animations.promptSequence.getRectangle().x - TangleUI.getRect("speechBubble", "transitionTo").x;
            TransitionCSSUtil.setTranslate(_speechBubble, x, 0);
        };

        //Bit too much code required to dynamically update a transition...
        var _speechBubbleBounds = new Rectangle();
        var setNextSpeechBubble = function(){
            _speechBubble = _speechBubble || SpeechBubble.createSpeechBubble(document.body, appConfig.menuButtonPromptZ);//TODO hardcoded doc.body: should be  a parent arg
            _speechBubble.style.display = "block";
            _speechBubbleBounds.updateToRect(TangleUI.getRect("speechBubble"));
            _speechBubbleBounds.width = SpeechBubble.update(_speechBubble, _getMessageFunction(_progressNormal), _speechBubbleBounds);
            _speechBubbleBounds.x = Math.round(TangleUI.bounds.width * 1.1);
            TangleUI.setRect("speechBubble", "transitionFrom", _speechBubbleBounds);
            _speechBubble.style.transform = "translate(" + _speechBubbleBounds.width * 2 + "px, 0px)";//get it off screen
            var spacer = TangleUI.getRect("progressGraphic").width * .5;
            _speechBubbleBounds.x = Math.round(TangleUI.bounds.width - spacer - _speechBubbleBounds.width);
            TangleUI.setRect("speechBubble", "transitionTo", _speechBubbleBounds);
            _speechBubble.style.left = _speechBubbleBounds.x + "px";
            _speechBubble.style.top = _speechBubbleBounds.y + "px";
            TransitionStore.getTransition("speechBubbleIn");//TODO: bit of a hack, getTransition resizes...
            TransitionStore.getTransition("speechBubbleHover");
            TransitionStore.getTransition("speechBubbleOut");
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
            _animations.button = TransitionStore.getAnimationByTransitionId("menuButtonIn", updateTransitionMenuButton, startIdleTimer);
            _animations.button.play();
        };
        var animateButtonOut = function(){
            _animations.button = TransitionStore.getAnimationByTransitionId("menuButtonIn", updateTransitionMenuButton, stop);
            _animations.button.playReverse();
        };

        var playPromptSequence = function(){
            var transitions = [
                {transitionId:"progressButtonOut", updateCallback : renderAnimatingPie},
                {transitionId:"progressButtonIn", updateCallback : renderAnimatingPixelGuy},
                {transitionId:"speechBubbleIn", updateCallback : renderAnimatingSpeechBubble},
                {transitionId:"speechBubbleHover", updateCallback : renderAnimatingSpeechBubble},
                {transitionId:"speechBubbleOut", updateCallback : renderAnimatingSpeechBubble},
                {transitionId:"progressButtonOut", updateCallback : renderAnimatingPixelGuy},
                {transitionId:"progressButtonIn", updateCallback : renderAnimatingPie}
            ];
            _animations.promptSequence = _animations.promptSequence || new ChainedRectangleTransitionAnimator();
            _animations.promptSequence.setTransitions(transitions);
            setNextSpeechBubble();
            _animations.promptSequence.play(startIdleTimer);
        };

        var stopPromptSequence = function(){
            if(_animations.promptSequence){
                _animations.promptSequence.stop();
            }
            hideSpeechBubble();
        };

        //--------TO STATS MODULE IN/OUT---------
        //This is still very messy due to dynamic properties and showIframe callback

        var playToStatsViewAnimation = function(){
            if( (_animations.toStats1 && _animations.toStats1.isAnimating()) ||
                (_animations.toStats2 && _animations.toStats2.isAnimating()) ){
                console.log("MenuButton.playToStatsViewAnimation() transition active, skipping");
                return;//already transitioning
            }
            resizeCanvas(TangleUI.bounds.width, TangleUI.bounds.height);
            _canvas.style.left = _canvas.style.top = "0px";
            _bgRipple.init(_canvas, TangleUI.getRect("menuButton"), appConfig.themeColor, "#FFFFFF");
            stopIdleTimer();
            hideSpeechBubble();
            var bounds = TangleUI.getRect("menuButton");
            _avatarBounds.update(_avatarBounds.x + bounds.x, _avatarBounds.y + bounds.y, _avatarBounds.width, _avatarBounds.height);
            TangleUI.setRect("menuButtonAvatarCenter", "transitionFrom", _avatarBounds);

            _animations.toStats1 = TransitionStore.getAnimationByTransitionId("pixelGuyToStatsModule1", renderToStatsAnimation, toStats1AnimationComplete);
            _animations.toStats1.play();
        };

        var toStats1AnimationComplete = function(){
            console.log("MenuButton.toStats1AnimationComplete()");
            if(showStatsModuleCallback){
                showStatsModuleCallback();
            }
            TangleUI.setRect("menuButtonAvatarZoomed", "default", _animations.toStats1.getRectangle());
            _animations.toStats2 = TransitionStore.getAnimationByTransitionId("pixelGuyToStatsModule2", renderToStatsAnimation, stop);
            _animations.toStats2.play();
        };

        var renderToStatsAnimation = function(normal, bounds){
            _context.fillStyle = appConfig.appBgColor;
            _context.fillRect(0,0,_canvas.width, _canvas.height);
            incrementPulse();//consider moving into render()
            _bgRipple.render(_pulseNormal);
            var scale = bounds.width / (PixelGuyHeadSprite.unscaledWidth - 1);//shadow screws up centering otherwise
            PixelGuyHeadSprite.renderAvatar(_context, bounds.x, bounds.y, scale, _progressNormal);
        };

    }
}());