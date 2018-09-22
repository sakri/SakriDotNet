/**
 * DEPENDENCIES:
 * MathLib, Rectangle, AppLayout
 *
 *
 */


(function() {

    window.MenuButton = function(showStatsModuleCallback, backButtonUrl) {

        //PUBLIC API

        this.start = function(){
            //console.log("MenuButton.start()");
            var size = Math.min(AppLayout.bounds.width * .25, AppLayout.bounds.height * .2);
            resize(size, size);
            _donut = _donut || new DonutChart("#FFFFFF", appConfig.themeColor, _pulseColor, "#222222");
            _progressNormal = AppData.getAchievementNormal();
            render();
            translateButtonIn();
        };

        this.end = function(){
            if(!_canvas){
                return;
            }
            stopIdleTimer();
            translateButtonOut();
        };

        this.stop = function(){
            //console.log("MenuButton.stop()")
            if(!_canvas){
                return;
            }
            stopIdleTimer();
            _unitAnimator.stop();
            _canvas.style.display = "none";//TODO: shit hack, refactor
            removeSpeechBubble();
        };

        this.addToPulse = function(){
            if(_unitAnimator.isAnimating()){
                return;
            }
            incrementPulse();
            render();
            startIdleTimer();
        };

        //could be better...
        this.missionAccomplished = function(){
            _missionAccomplished = true;
        };


        /*
        this.updateStatsProgress = function(normal){
            console.log("MenuButton.updateStatsProgress()", normal);
            if(!_canvas ||!_unitAnimator ||_unitAnimator.isAnimating() || _progressNormal == normal){
                return;
            }
            if(_donutBounds.x > _canvas.width){
                _progressNormal = normal;
                animateDonutIn();
                return;
            }
            //animate if pie is visible
            _statsUpdateAnimation.from = _progressNormal;
            _statsUpdateAnimation.start.to = normal;
            var diff = _statsUpdateAnimation.start.to - _statsUpdateAnimation.from;
            _unitAnimator.start(2000 * (1 - diff), animateStatsProgressUpdate);
            startIdleTimer();
        };

        var _statsUpdateAnimation = {from: 0, to:0};
        function animateStatsProgressUpdate(normal){
            _progressNormal = UnitEasing.easeOutSine(MathUtil.interpolate(normal, _statsUpdateAnimation.from, _statsUpdateAnimation.to));
            incrementPulse();
            render();
        };*/


        //PRIVATE PROPERTIES & METHODS

        var  _donut,  _canvas, _context, _speechBubble,  _progressNormal = 0, _pulseNormal = 0,
            _avatarScale, _pulseRgb, _unitAnimator = new UnitAnimator(),
            _canvasBounds = new Rectangle(),
            _donutBounds = new Rectangle(), _avatarBounds = new Rectangle(),
            _rectTransition = new RectangleTransition(),
            _missionAccomplished = false,
            _statsVisited = false,
            _promptMessages = [
            "Click me for your stats!",
            "Doing great!",
            "Steady rockin!",
            "Like a Boss!!!",
            "You on FIRE!!!11",
            "Celebrate in 3-2-1..."],
            _completedPromptMessages = [
                "Tell your friends!",
                "Tell yo mama!",
                "Sharing is caring!",
                "I'm @sakri on twitter..."
            ];

        function incrementPulse(){
            _pulseNormal += .02;
            _pulseNormal -= _pulseNormal > 1 ? 1 : 0;
        };

        var menuButtonClickHandler = function(){
            if( _canvas.width == AppLayout.bounds.width){
                console.log("MenuButton.menuButtonClickHandler() transition active, skipping");
                return;//already transitioning
            }
            _statsVisited = true;//hmm, better stored somewhere else?
            resize(AppLayout.bounds.width, AppLayout.bounds.height);
            playToStatsViewAnimation();
        };

        //resizes canvas and positions eiter to button (bottom right) or transition (full screen) state
        var resize = function(width, height){
            //console.log("MenuButton.resize()", width, height);
            initCanvas();//Also initializes bg colors, refactor
            _context = CanvasUtil.resize(_canvas, width, height);
            CanvasUtil.enablePixelArtScaling(_context);
            if(width == AppLayout.bounds.width){
                _canvas.style.left = _canvas.style.top = "0px";
                calculateButtonLayoutFullScreen();
            }else{
                _canvas.style.left = AppLayout.bounds.right() - width + "px";
                _canvas.style.top = AppLayout.bounds.bottom() - height + "px";
                calculateButtonLayout();
            }
        };

        var calculateButtonLayout = function(){
            var ss = SakriDotNetSpriteSheet.getSpriteSheetData("head");
            AppLayout.updateRectToLayoutRectState(_avatarBounds, "progressGraphic");
            _avatarScale = Math.floor(_avatarBounds.height / ss.height);
            _avatarBounds.width = _avatarBounds.height = _avatarScale * ss.height;
            _donutBounds.updateToRect(_avatarBounds);
            _canvasBounds.update(0, 0, _canvas.width, _canvas.height);
        };

        //only happens prior to transition from app to statsView
        var calculateButtonLayoutFullScreen = function(){
            //button background is drawn to _canvasBounds
            _canvasBounds.x = AppLayout.bounds.right() - _canvasBounds.width;
            _canvasBounds.y = AppLayout.bounds.bottom() - _canvasBounds.width;
            _avatarBounds.x += AppLayout.bounds.width - _canvasBounds.width;
            _avatarBounds.y += AppLayout.bounds.height - _canvasBounds.height;
        };

        var initCanvas = function(){
            if(_canvas){
                _canvas.style.display = "block";
                return;
            }
            _canvas = document.createElement("canvas");
            document.body.appendChild(_canvas);
            _canvas.style.position = "fixed";
            _canvas.style.zIndex = appConfig.menuButtonZ;
            _canvas.addEventListener("click", menuButtonClickHandler);

            _pulseRgb = MathUtil.hexToRgb(appConfig.themeColor);
            _pulseColor = MathUtil.rgbToHex(
                Math.round(MathUtil.interpolate(.5, _pulseRgb.r, 255)),
                Math.round(MathUtil.interpolate(.5, _pulseRgb.g, 255)),
                Math.round(MathUtil.interpolate(.5, _pulseRgb.b, 255))
            );
        };
        var _pulseColor;

        //======================================================
        //==============:: Render ::=======================
        //======================================================

        function render(){
            //_context.clearRect(0,0,_canvas.width, _canvas.height);
            renderButtonBG();
            if(_donutBounds.x < _canvas.width){
                _donut.render(_canvas, _donutBounds, _progressNormal);
            }else{
                PixelGuyHeadSprite.renderAvatar(_context, _avatarBounds.x, _avatarBounds.y, _avatarScale, _progressNormal);
            }
        };

        function renderButtonBG(){

            _context.save();
            //_context.fillStyle = appConfig.appBgColor;
            _context.clearRect(0, 0, _canvas.width, _canvas.height);

            //TODO: these calculations shouldn't happen on every render
            var twelveOClock = Math.PI * 1.5;
            var numRipples = 4;//@derschmale
            var centerAlpha = .6;

            var centerRadiusNormal = .8;
            var pulseRadianNormal = (1 - centerRadiusNormal);
            var i, fromNormal, toNormal, rippleNormal, radius,
                centerRadius = _canvasBounds.width * centerRadiusNormal,
                pulseRadius = _canvasBounds.width * pulseRadianNormal,
                rippleAlpha,
                spacer = pulseRadianNormal / numRipples;
            var maxStrokeWidth = pulseRadius * .3;

            //draw whiteBG
            _context.beginPath();
            _context.fillStyle = "#FFFFFF";
            _context.moveTo(_canvasBounds.right(), _canvasBounds.bottom());
            _context.arc(_canvasBounds.right(), _canvasBounds.bottom(), _canvasBounds.width, Math.PI, twelveOClock);
            _context.fill();

            //draw ripples, RIPPLES!!!11
            _context.strokeStyle = appConfig.themeColor;
            for(i = 0; i < numRipples; i++){
                fromNormal = spacer * i / pulseRadianNormal;
                toNormal = spacer * (i + 1) / pulseRadianNormal;
                rippleNormal = UnitEasing.easeOutSine(MathUtil.interpolate(_pulseNormal, fromNormal, toNormal));
                radius = centerRadius + rippleNormal * pulseRadius;

                _context.beginPath();
                _context.lineWidth = (1 - rippleNormal) * maxStrokeWidth;
                //rippleAlpha = MathUtil.interpolate(i/numRipples, centerAlpha, 0);
                //_context.strokeStyle = _pulseColor;//MathUtil.createRGBAColorString(_pulseRgb.r, _pulseRgb.g, _pulseRgb.b, .5);
                _context.moveTo(_canvasBounds.right() - radius, _canvasBounds.bottom());
                _context.arc(_canvasBounds.right(), _canvasBounds.bottom(), radius, Math.PI, twelveOClock);
                _context.stroke();
            }

            //draw center
            _context.beginPath();
            _context.fillStyle = appConfig.themeColor;
            //_context.fillStyle = _pulseColor;//MathUtil.createRGBAColorString(_pulseRgb.r, _pulseRgb.g, _pulseRgb.b, centerAlpha);
            _context.moveTo(_canvasBounds.right(), _canvasBounds.bottom());
            radius = centerRadiusNormal * _canvasBounds.width - maxStrokeWidth/2 + maxStrokeWidth * _pulseNormal;
            _context.arc(_canvasBounds.right(), _canvasBounds.bottom(), radius, Math.PI, twelveOClock);
            _context.fill();

            _context.restore();
        };

        //======================================================
        //==============:: PROMPT ::=======================
        //======================================================

        function showSpeechBubble(){
            var message = "";
            if(_missionAccomplished){
                message = _completedPromptMessages[Math.floor(Math.random() * _completedPromptMessages.length)];
            }else{
                message = _statsVisited ? _promptMessages[Math.round((_promptMessages.length - 1) * _progressNormal)] : _promptMessages[0];
            }
            _speechBubble = _speechBubble || SpeechBubble.createSpeechBubble(document.body, appConfig.menuButtonPromptZ);//TODO hardcoded doc.body: should be  a parent arg
            _speechBubble.style.display = "block";
            AppLayout.updateLayoutRectBoundsToState("speechBubble", "transitionFrom");
            var bounds = AppLayout.getJsonRectBounds("speechBubble");
            bounds.y += (AppLayout.bounds.bottom() - _canvas.height);
            SpeechBubble.updateSpeechBubble(_speechBubble, message, bounds.width, bounds.height);
            playSpeechBubbleAnimation();
        };

        function removeSpeechBubble(){
            if(!_speechBubble){
                return;
            }
            _speechBubble.style.display = "none";
        };

        //======================================================
        //==============:: IDLE MANAGER::=======================
        //======================================================

        var _idleTimerId = -1, _idleDuration = 4000;

        var startIdleTimer = function(){
            stopIdleTimer();
            _idleTimerId = setTimeout(animateDonutOut, _idleDuration);
        };

        var stopIdleTimer = function(){
            clearTimeout(_idleTimerId);
            _idleTimerId = -1;
        };

        //======================================================
        //==============:: ANIMATIONS::==============
        //======================================================

        //only one element is translated at any given moment.

        function updateCanvasRectTransition(normal){
            _rectTransition.updateToProgressNormal(normal);
            incrementPulse();//consider moving into render()
            render();
        };

        //--------TRANSLATE BUTTON IN/OUT---------
        var translateButtonIn = function(){
            _rectTransition.fromRect.update(_canvas.width, _canvas.height);
            _rectTransition.toRect.update(0, 0);
            _rectTransition.init(AppLayout.getJsonRectBounds("menuButton"));
            _unitAnimator.start(1000, updateTransitionMenuButton, startIdleTimer, UnitEasing.easeOutSine);
        };

        var translateButtonOut = function(){
            _rectTransition.fromRect.update(0, 0);
            _rectTransition.toRect.update(_canvas.width, _canvas.height);
            _rectTransition.init(_canvasBounds);
            _unitAnimator.start(1000, updateTransitionMenuButton, null, UnitEasing.easeOutSine);
        };

        function updateTransitionMenuButton(normal){
            updateCanvasRectTransition(normal);
            _canvas.style.transform = TransitionCSSUtil.getTranslateStringFromRect(AppLayout.getJsonRectBounds("menuButton"));
        };


        //--------DONUT CHART IN/OUT---------
        var animateDonutIn = function(){
            //console.log("MenuButton.animateDonutIn()");
            _avatarBounds.x = AppLayout.updateLayoutRectBoundsToState("progressGraphic", "transitionFrom").x;
            _rectTransition.fromRect.update(_avatarBounds.x);
            _rectTransition.toRect.update(AppLayout.updateLayoutRectBoundsToState("progressGraphic", "default").x);
            _rectTransition.init(_donutBounds);
            _unitAnimator.start(500, updateCanvasRectTransition, startIdleTimer , UnitEasing.easeOutSine);
        };

        var animateDonutOut = function(){
            _avatarBounds.x = AppLayout.updateLayoutRectBoundsToState("progressGraphic", "transitionFrom").x;
            _rectTransition.fromRect.update(AppLayout.updateLayoutRectBoundsToState("progressGraphic", "default").x);
            _rectTransition.toRect.update(_avatarBounds.x);
            //console.log("MenuButton.animateDonutOut() : ", _rectTransition.fromRect.toString(), _rectTransition.toRect.toString());
            _rectTransition.init(_donutBounds);
            _unitAnimator.start(500, updateCanvasRectTransition, animateAvatarIn , UnitEasing.easeInSine);
        };

        //--------AVATAR CHART IN/OUT---------
        var animateAvatarIn = function(){
            _donutBounds.x = AppLayout.updateLayoutRectBoundsToState("progressGraphic", "transitionFrom").x;
            _rectTransition.fromRect.update(_donutBounds.x);
            _rectTransition.toRect.update(AppLayout.updateLayoutRectBoundsToState("progressGraphic", "default").x);
            //console.log("MenuButton.animateAvatarIn() : ", _rectTransition.fromRect.toString(), _rectTransition.toRect.toString());
            _rectTransition.init(_avatarBounds);
            _unitAnimator.start(500, updateCanvasRectTransition, showSpeechBubble , UnitEasing.easeOutSine);
        };
        var animateAvatarOut = function(){
            //console.log("MenuButton.animateAvatarOut()");
            _donutBounds.x = AppLayout.updateLayoutRectBoundsToState("progressGraphic", "transitionFrom").x;
            _rectTransition.fromRect.update(AppLayout.updateLayoutRectBoundsToState("progressGraphic", "default").x);
            _rectTransition.toRect.update(AppLayout.updateLayoutRectBoundsToState("progressGraphic", "transitionFrom").x);
            _rectTransition.init(_avatarBounds);
            _unitAnimator.start(500, updateCanvasRectTransition, animateDonutIn , UnitEasing.easeOutSine);
        };

        //--------SPEECH BUBBLE IN/OUT---------
        // one animation, 25% in, 50% hover, 25% out, calls pulse
        var playSpeechBubbleAnimation = function(){
            _rectTransition.fromRect.update(AppLayout.bounds.right());
            _rectTransition.toRect.update(_rectTransition.fromRect.x - _speechBubble.offsetWidth * 1.5);
            _rectTransition.init(AppLayout.getJsonRectBounds("speechBubble"));
            updateSpeechBubbleTranslate(0);
            _unitAnimator.start(3500, updateSpeechBubbleTranslate, speechBubbleAnimationComplete);
        };

        var speechBubbleAnimationComplete = function(){
            //console.log("MenuButton.speechBubbleAnimationComplete()");
            animateAvatarOut();
            startIdleTimer();//no need, this is also called on donut in. Maybe good to clear it?
            removeSpeechBubble();
        };

        function updateSpeechBubbleTranslate(normal){
            if(normal >.1 && normal <.9){
                incrementPulse();
                render();
                return;
            }
            var positionNormal = normal < .15 ? MathUtil.smoothstep(normal, 0, .15) : 1 - MathUtil.smoothstep(normal, .85, 1);
            _rectTransition.updateToProgressNormal(positionNormal);
            _speechBubble.style.transform = TransitionCSSUtil.getTranslateStringFromRect(AppLayout.getJsonRectBounds("speechBubble"));
            incrementPulse();
            render();
        };


        //--------TO STATS MODULE IN/OUT---------
        var playToStatsViewAnimation = function(){
            _donutBounds.x = AppLayout.updateLayoutRectBoundsToState("progressGraphic", "transitionFrom").x;
            stopIdleTimer();
            removeSpeechBubble();
            //_canvas.style.setProperty("filter", "");
            //_canvas.style.setProperty("-webkit-filter", "");
            _rectTransition.fromRect.updateToRect(_avatarBounds);
            AppLayout.updateRectToLayoutRectState(_rectTransition.toRect, "transitionMenuButtonToCenter");
            _rectTransition.init(_avatarBounds);
            //console.log("MenuButton.playToStatsViewAnimation()", _avatarBounds.toString(), _rectTransition.fromRect.toString(), _rectTransition.toRect.toString());
            _unitAnimator.start(500, updateToStatsViewTransition, playToStatsViewAnimationStep2, UnitEasing.easeOutSine);
        };

        var renderToStatsViewPixelGuy = function(normal){
            _rectTransition.updateToProgressNormal(normal);
            var scale = _avatarBounds.width / (PixelGuyHeadSprite.unscaledWidth - 1);//shadow screws up centering otherwise
            PixelGuyHeadSprite.renderAvatar(_context, _avatarBounds.x, _avatarBounds.y, scale, _progressNormal);
        };

        var updateToStatsViewTransition = function(normal){
            incrementPulse();//consider moving into render()
            renderButtonBG();
            renderToStatsViewPixelGuy(normal);
        };

        var playToStatsViewAnimationStep2 = function(){
            if(showStatsModuleCallback){
                showStatsModuleCallback();
            }
            _rectTransition.fromRect.updateToRect(_rectTransition.toRect);
            var size = AppLayout.bounds.biggerSide() * 1.3;
            _rectTransition.toRect.update(AppLayout.bounds.centerX() - size * .5, AppLayout.bounds.centerY() - size * .5, size, size);
            _rectTransition.init(_avatarBounds);
            //console.log("MenuButton.playToStatsViewAnimationStep2()", _avatarBounds.toString(), _rectTransition.fromRect.toString(), _rectTransition.toRect.toString());
            _unitAnimator.start(500, updateToStatsViewTransition2, toStatsViewAnimationComplete, UnitEasing.easeInSine);
        };

        var updateToStatsViewTransition2 = function(normal){
            _context.fillStyle = appConfig.appBgColor;
            _context.fillRect(0, 0, _canvas.width, _canvas.height);
            renderToStatsViewPixelGuy(normal);
        };

        var toStatsViewAnimationComplete = function(){
            //console.log("MenuButton.toStatsViewAnimationComplete()");
            removeSpeechBubble();
            stopIdleTimer();
            _context.clearRect(0,0,_canvas.width, _canvas.height);
            _canvas.style.display = "none";
        };

    }
}());