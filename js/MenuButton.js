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
        };

        this.addToPulse = function(){
            if(_unitAnimator.isAnimating()){
                return;
            }
            incrementPulse();
            render();
            startIdleTimer();
        };


        //PRIVATE PROPERTIES & METHODS

        var  _donut,  _canvas, _context, _speechBubble,  _progressNormal = 0, _pulseNormal = 0,
            _avatarScale, _pulseRgb, _unitAnimator = new UnitAnimator(),
            _canvasBounds = new Rectangle(),
            _speechBubbleBounds = new Rectangle(),
            _donutDisplayBounds = new Rectangle(), _donutBounds = new Rectangle(),
            _avatarDisplayBounds = new Rectangle(), _avatarBounds = new Rectangle(),
            _statsVisited = false, _promptMessages = [
            "Click for your stats!",
            "Doing great!",
            "Steady rockin!",
            "Like a Boss!!!",
            "You on FIRE!!!11",
            "Celebrate in 3-2-1..."
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
            //in the past a context could be lost during resize
            _canvas.width = width
            _canvas.height = height;
            _context = _canvas.getContext("2d");
            _context.imageSmoothingEnabled = false;
            _context.mozImageSmoothingEnabled = false;
            _context.webkitImageSmoothingEnabled = false;
            _context.msImageSmoothingEnabled = false;
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

            _avatarDisplayBounds.x = _avatarDisplayBounds.y = Math.round(_canvas.width * .33);
            _avatarDisplayBounds.width = _avatarDisplayBounds.height = Math.round(_canvas.width * .65);
            _avatarScale = Math.floor(_avatarDisplayBounds.height / ss.height);
            _avatarDisplayBounds.width = _avatarDisplayBounds.height = _avatarScale * ss.height;
            _avatarBounds.updateToRect(_avatarDisplayBounds);

            _donutDisplayBounds.updateToRect(_avatarDisplayBounds);
            _donutBounds.updateToRect(_donutDisplayBounds);

            _canvasBounds.update(0, 0, _canvas.width, _canvas.height);
        };

        //only happens prior to transition from app to statsView
        var calculateButtonLayoutFullScreen = function(){
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
            _speechBubble = _speechBubble || SpeechBubble.createSpeechBubble(document.body, appConfig.menuButtonPromptZ);//TODO hardcoded doc.body: should be  a parent arg
            _speechBubble.style.display = "block";
            _speechBubbleBounds.width = _canvas.width * 2;
            _speechBubbleBounds.height = _canvas.height * .45;
            var message = _statsVisited ? _promptMessages[Math.round((_promptMessages.length - 1) * _progressNormal)] : _promptMessages[0];
            SpeechBubble.updateSpeechBubble(_speechBubble, message, _speechBubbleBounds.width, _speechBubbleBounds.height);
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

        //TODO: move to animations.js
        //only one element is translated at any given moment.

        var _rectTransition = new RectangleTransition(), _transitionElement,
            _transitionRect = new Rectangle(), _transFrom = new Rectangle(), _transTo = new Rectangle;

        function updateElementTransition(normal){
            _rectTransition.updateToProgressNormal(normal);
            _transitionElement.style.transform = TransitionCSSUtil.getTranslateStringFromRect(_transitionRect);
            incrementPulse();//consider moving into render()
            render();
        };

        function updateCanvasRectTransition(normal){
            _rectTransition.updateToProgressNormal(normal);
            incrementPulse();//consider moving into render()
            render();
        };

        function getOutOfScreenX(){
            return _canvas.width + 10;//used a few times, easier to update for all at once
        };

        //==================> TRANSITIONS

        //--------TRANSLATE BUTTON IN/OUT---------
        var translateButtonIn = function(){
            _transitionElement = _canvas;
            _transFrom.update(_canvas.width, _canvas.height);
            _transTo.update(0, 0);
            _transitionRect = _canvasBounds;//needed to update canvas.style.transition
            _rectTransition.init(_transitionRect, _transFrom, _transTo);
            _unitAnimator.start(1000, updateElementTransition, startIdleTimer, UnitEasing.easeOutSine);
        };

        var translateButtonOut = function(){
            _transitionElement = _canvas;
            _transFrom.update(0, 0);
            _transTo.update(_canvas.width, _canvas.height);
            _rectTransition.init(_canvasBounds, _transFrom, _transTo);
            _unitAnimator.start(1000, updateElementTransition, null, UnitEasing.easeOutSine);
        };

        //--------DONUT CHART IN/OUT---------
        var animateDonutIn = function(){
            _avatarBounds.x = getOutOfScreenX();
            _transFrom.update(_avatarBounds.x);
            _transTo.update(_donutDisplayBounds.x);
            _rectTransition.init(_donutBounds, _transFrom, _transTo);
            _unitAnimator.start(500, updateCanvasRectTransition, startIdleTimer , UnitEasing.easeOutSine);
        };

        var animateDonutOut = function(){
            //console.log("MenuButton.animateDonutOut()");
            _avatarBounds.x = getOutOfScreenX();
            _transFrom.update(_donutDisplayBounds.x);
            _transTo.update(_avatarBounds.x);
            _rectTransition.init(_donutBounds, _transFrom, _transTo);
            _unitAnimator.start(500, updateCanvasRectTransition, animateAvatarIn , UnitEasing.easeInSine);
        };

        //--------AVATAR CHART IN/OUT---------
        var animateAvatarIn = function(){
            //console.log("MenuButton.animateAvatarIn()");
            _donutBounds.x = getOutOfScreenX();
            _transFrom.update(_donutBounds.x);
            _transTo.update(_avatarDisplayBounds.x);
            _rectTransition.init(_avatarBounds, _transFrom, _transTo);
            _unitAnimator.start(500, updateCanvasRectTransition, showSpeechBubble , UnitEasing.easeOutSine);
        };
        var animateAvatarOut = function(){
            //console.log("MenuButton.animateAvatarOut()");
            _transFrom.update(_avatarDisplayBounds.x);
            _transTo.update(_donutBounds.x);
            _rectTransition.init(_avatarBounds, _transFrom, _transTo);
            _unitAnimator.start(500, updateCanvasRectTransition, animateDonutIn , UnitEasing.easeOutSine);
        };

        //--------SPEECH BUBBLE IN/OUT---------
        // one animation, 25% in, 50% hover, 25% out, calls pulse
        var playSpeechBubbleAnimation = function(){
            _speechBubbleBounds.y = AppLayout.bounds.height - _canvas.height * .7 - _speechBubble.offsetHeight;
            _transFrom.update(AppLayout.bounds.right());
            _transTo.update(_transFrom.x - _speechBubble.offsetWidth * 1.5);
            _rectTransition.init(_speechBubbleBounds, _transFrom, _transTo);
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
            _speechBubble.style.transform = TransitionCSSUtil.getTranslateStringFromRect(_speechBubbleBounds);
            incrementPulse();
            render();
        };


        //--------TO STATS MODULE IN/OUT---------
        var playToStatsViewAnimation = function(){
            _donutBounds.x = getOutOfScreenX();
            stopIdleTimer();
            removeSpeechBubble();
            //_canvas.style.setProperty("filter", "");
            //_canvas.style.setProperty("-webkit-filter", "");

            _transFrom.update(_avatarBounds.x, _avatarBounds.y, _avatarBounds.width, _avatarBounds.height);
            var fullScreenSize = Math.floor(AppLayout.bounds.smallerSide() * .5);
            _transTo.update(
                Math.floor(AppLayout.bounds.centerX() - fullScreenSize * .5),
                Math.floor(AppLayout.bounds.centerY() - fullScreenSize * .5),
                fullScreenSize, fullScreenSize);
            _rectTransition.init(_avatarBounds, _transFrom, _transTo);
            //console.log("MenuButton.playToStatsViewAnimation()", _avatarBounds.toString(), _transFrom.toString(), _transTo.toString());
            _unitAnimator.start(500, updateToStatsViewTransition, playToStatsViewAnimationStep2, UnitEasing.easeOutSine);
        };

        var updateToStatsViewTransition = function(normal){
            _rectTransition.updateToProgressNormal(normal);
            incrementPulse();//consider moving into render()
            renderButtonBG();
            var scale = _avatarBounds.width / (PixelGuyHeadSprite.unscaledWidth - 1);//shadow screws up centering otherwise
            PixelGuyHeadSprite.renderAvatar(_context, _avatarBounds.x, _avatarBounds.y, scale, _progressNormal);
        }

        var playToStatsViewAnimationStep2 = function(){
            if(showStatsModuleCallback){
                showStatsModuleCallback();
            }
            _transFrom.updateToRect(_transTo);
            var bigAvatar = Math.floor(AppLayout.bounds.biggerSide() * 2);
            _transTo.update(
                Math.floor(_transFrom.x - bigAvatar * .5),
                Math.floor(_transFrom.y - bigAvatar * .5),
                bigAvatar, bigAvatar);
            _rectTransition.init(_avatarBounds, _transFrom, _transTo);
            //console.log("MenuButton.playToStatsViewAnimationStep2()", _avatarBounds.toString(), _transFrom.toString(), _transTo.toString());
            _unitAnimator.start(500, updateToStatsViewTransition, toStatsViewAnimationComplete, UnitEasing.easeInSine);
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