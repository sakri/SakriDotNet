/**
 * Created by Sakri Rosenstrom on 15-06-18
 * DEPENDENCIES : MathUtil, Rectangle, Sprites, UnitAnimator, AppLayout
 *
 * Contains:
 *
 *      LoaderCircles:
 *      - manages "loading circles" in loader
 *
 *      SakriDotNetLoader
 *      - manages loader assets (pixel guy, circles and title), and animations
 *
 *      SakriDotNetLoaderController
 *      - reads html page, observes load, updates Loader
 *
 *      SakriDotNetLoaderTestController
 *      - mocks LoaderController behaviour

 */


//==============================================
//=============::LOADER CIRCLES::===============
//==============================================

(function(){

    //Receives a (potentially) changing number of circles representing "load items"
    //Animates circles from "emitter x,y" to evenly spaced out locations within bounds
    //Does not receive progress information for individual "load items"
    //Instead, displays the "last ball" as "loading" using _fakeProgressNormal
    window.LoaderCircles = function(){

        var _circles,
            _fakeProgressNormal = 0,
            _emitter, _radius, _lineWidth = 2;


        this.udpateCircles = function(colors, numCircles, bounds, emitter){

            if(_circles && _circles.length > 0 && _circles.length === numCircles){
                return;
            }

            _circles = [];
            var circleXIncrement = bounds.width / numCircles;
            _radius = Math.min(Math.round(circleXIncrement * .3), bounds.height);
            _lineWidth = _radius * .3;
            _emitter = emitter;
            for(var i=0; i < numCircles; i++){
                _circles[i] = {
                    currentX : emitter.x,
                    currentY : emitter.y,
                    endX : Math.round(bounds.x + circleXIncrement * i + circleXIncrement * .5),
                    endY : bounds.y,
                    color : colors[i % colors.length],
                    animNormal : 0
                };
            }
        };

        this.renderLoading = function(normal, context){
            var renderCount = Math.round(normal * _circles.length);
            var i, circle, animNormal, radiusNormal, radius;

            var circleScaleDurationNormal = .6;//each circles scaleInOut duration, out of total duration
            var circleScaleDurationNormalSpacer = (1 - circleScaleDurationNormal) / renderCount;
            var circleSpacing = 1 / renderCount;

            context.strokeStyle = "#222222";
            context.lineWidth = _lineWidth;
            for(i=0; i<renderCount; i++){
                circle = _circles[i];
                if(!circle){
                    //console.log("renderLoading no circle : ", i, renderCount, _circles.length, normal, "TODO: Remove");
                    return;
                }
                circle.animNormal = Math.min(circle.animNormal + .03, 1);
                animNormal = UnitEasing.easeOutSine(circle.animNormal, 0, 1, 1);
                circle.currentX = MathUtil.interpolate(animNormal, _emitter.x, circle.endX);
                circle.currentY = MathUtil.interpolate(animNormal, _emitter.y, circle.endY);
                context.fillStyle = circle.color;

                radiusNormal = MathUtil.smoothstep(
                    _fakeProgressNormal,
                    i * circleScaleDurationNormalSpacer,
                    i * circleScaleDurationNormalSpacer + circleSpacing * 2
                );
                radius = _radius + Math.sin(radiusNormal * Math.PI) * (_radius * .4);//ok.. whatever?

                context.beginPath();
                if(i === renderCount - 1){
                    var angle = Math.PI * _fakeProgressNormal;
                    context.arc(circle.currentX, circle.currentY, radius, Math.PI - angle, Math.PI + angle);
                }else{
                    context.arc(circle.currentX, circle.currentY, radius, 0, MathUtil.PI2);
                }
                context.closePath();
                context.fill();
                context.stroke();
            }
            _fakeProgressNormal += .01;
            _fakeProgressNormal = (_fakeProgressNormal < 1) ? _fakeProgressNormal : 0;
        };

        this.introComplete = function(){
            return _circles && _circles.length && _circles[_circles.length - 1].animNormal === 1;
        };

        this.prepareExit = function(endX, endY){
            var i, circle;
            for(i = 0; i<_circles.length; i++){
                circle = _circles[i];
                circle.startX = circle.endX;
                circle.startY = circle.endY;
                circle.endX = endX;
                circle.endY = endY;
            }
        };

        this.renderLoaderCirclesCompleteTransition = function(normal, context){
            var i, circle, smoothStepIncrement = (1 / _circles.length), animNormal;
            context.strokeStyle = "#222222";
            context.lineWidth = _lineWidth;
            for(i=0; i<_circles.length; i++){
                circle = _circles[i];
                animNormal = MathUtil.smoothstep(normal, smoothStepIncrement * i, 1);
                circle.currentX = MathUtil.interpolate(normal, circle.startX, circle.endX);
                circle.currentY = MathUtil.interpolate(animNormal, circle.startY, circle.endY);
                context.fillStyle = circle.color;
                context.beginPath();
                context.arc(circle.currentX, circle.currentY, _radius, 0, MathUtil.PI2);
                context.closePath();
                context.fill();
                context.stroke();
            }
        };

    };
}());


//======================================================
//===============::SAKRI DOT NET LOADER::===============
//======================================================

(function() {

    window.SakriDotNetLoader = function() {

        //PRIVATE VARIABLES
        var _canvas, _context,
            _rectTransition = new RectangleTransition(),
            _unitAnimator = new UnitAnimator(),
            _pixelGuyBounds = new Rectangle(),
            _pixelGuyScale,
            _titleBounds,
            _laptopBounds = new Rectangle(),
            _circlesBounds = new Rectangle(),
            _circlesEmitter = {x:0, y:0},
            _circles = new LoaderCircles(),
            _title;

        //PUBLIC API

        this.init = function(){
            this.resize();
            createLoaderCanvas();
            createLoaderTitle();
            playPixelGuyIn();
        };

        this.updateCircles = function(colors, numCircles){
            if(_circles){
                _circles.udpateCircles(colors, numCircles, _circlesBounds, _circlesEmitter);
            }
        };

        this.circlesIntroComplete = function(){
            return !_unitAnimator.isAnimating() && _circles.introComplete();
        };

        this.render = function(normal){
            _context.fillStyle = appConfig.appBgColor;
            _context.fillRect(0, 0, _canvas.width, _canvas.height);
            PixelGuyTypingManager.render(_context, _pixelGuyBounds.x, _pixelGuyBounds.y, _pixelGuyScale, normal);
            if(!_unitAnimator.isAnimating()){
                _circles.renderLoading(normal, _context);//don't render during intro sequence
            }
        };

        this.playExitAnimation = function(callback){
            preparePixelGuyBoundsRockOut();
            playEndSequence(callback);
        };

        this.resize = function(){
            _unitAnimator.stop();
            calculateLayout();
        };

        //Private methods

        var calculateLayout = function(){
            _pixelGuyBounds.updateToRect(AppLayout.getJsonRectBounds("loaderPixelGuy"));
            _pixelGuyScale = Math.floor(Math.min(_pixelGuyBounds.width  / PixelGuyTypingSprite.unscaledWidth, _pixelGuyBounds.height  / PixelGuyTypingSprite.unscaledHeight));
            _pixelGuyBounds.width = PixelGuyTypingSprite.unscaledWidth * _pixelGuyScale;
            _pixelGuyBounds.height = PixelGuyTypingSprite.unscaledHeight * _pixelGuyScale;
            _pixelGuyBounds.x = Math.round(AppLayout.bounds.centerX() - _pixelGuyBounds.width * .5);
            _pixelGuyBounds.y = Math.round(AppLayout.bounds.centerY() - _pixelGuyBounds.height * .5);
            _laptopBounds.update(_pixelGuyBounds.x * .85, _pixelGuyBounds.y);

            _circlesBounds.update(
                Math.round(_pixelGuyBounds.x + _pixelGuyBounds.width * .1),
                Math.round(_pixelGuyBounds.y + _pixelGuyBounds.height * 1.6),
                Math.floor(_pixelGuyBounds.width * .8),
                Math.floor(_pixelGuyBounds.height * .1)
            );

            _circlesEmitter.x = Math.round(_pixelGuyBounds.x + _pixelGuyBounds.width * .25);
            _circlesEmitter.y = Math.round(_pixelGuyBounds.bottom() - _pixelGuyBounds.height * .2);

            _titleBounds = AppLayout.getJsonRectBounds("loaderTitle");
            _titleBounds.height = _pixelGuyBounds.height * .6;
        };

        var preparePixelGuyBoundsRockOut = function(){
            _circles.prepareExit(_pixelGuyBounds.x, -_pixelGuyBounds.centerY());
            _pixelGuyBounds.update(
                Math.round(_pixelGuyBounds.x + _pixelGuyBounds.width * .5),
                Math.round(_pixelGuyBounds.y - _pixelGuyBounds.height * .4),
                ButtrockManager.unscaledWidth * _pixelGuyScale,
                ButtrockManager.unscaledHeight * _pixelGuyScale
            );
            if(_pixelGuyBounds.right() > _canvas.width){
                _pixelGuyBounds.x =  _canvas.width - _pixelGuyBounds.width;
            }
        };

        var createLoaderTitle = function(){
            _title = document.createElement("h1");
            _title.style.color = "#222222";//needs to match dark pixels in sprites.js
            _title.style.position = "absolute";
            _title.style.overflow = "hidden";
            _title.style.textAlign = "center";
            _title.style.margin =  "0";
            _title.style.padding =  "0";
            _title.style.borderWidth = "0";
            _title.style.zIndex = appConfig.loaderTitleZ;
            _title.style.fontSize = Math.round(_titleBounds.height * .8) + "px";
            _title.style.width = _titleBounds.width + "px";
            _title.style.height = _titleBounds.height + "px";
            _title.style.left = _titleBounds.x + "px";
            _title.style.top = _titleBounds.y + "px";//should use css transition translate instead?
            _title.innerHTML = "sakri.net";
            document.body.appendChild(_title);
        };

        var createLoaderCanvas = function(){
            _canvas = _canvas || CanvasUtil.createCanvas(AppLayout.bounds.width, AppLayout.bounds.height, document.body, appConfig.loaderCanvasZ);
            _canvas.style.left = _canvas.style.top = "0px";
            _context = CanvasUtil.resize(_canvas, AppLayout.bounds.width, AppLayout.bounds.height);
            CanvasUtil.enablePixelArtScaling(_context);
        };


        //ANIMATIONS

        //TODO: create RectTransitionSequence() to handle this
        var playPixelGuyIn = function(){
            _title.style.display = "none";
            _rectTransition.fromRect.update(NaN, AppLayout.updateLayoutRectBoundsToState("loaderPixelGuy", "transitionFrom").y);
            _rectTransition.toRect.update(NaN, _pixelGuyBounds.y);
            _rectTransition.init(_pixelGuyBounds);
            _unitAnimator.start(300, _rectTransition.updateToProgressNormal, playTitleIn , UnitEasing.easeInSine);
        };

        var playTitleIn = function(){
            _title.style.display = "block";
            _rectTransition.toRect.update(NaN, _titleBounds.y);
            _rectTransition.fromRect.update(NaN, AppLayout.updateLayoutRectBoundsToState("loaderTitle", "transitionFrom").y);
            _rectTransition.init(_titleBounds);
            _unitAnimator.start(300, updateTitleAnimation, null , UnitEasing.easeInSine);
        };

        var updateTitleAnimation = function(normal){
            _rectTransition.updateToProgressNormal(normal);
            _title.style.top = _titleBounds.y + "px";//should use css transition translate instead?
        };

        var playEndSequence = function(callback){
            _rectTransition.fromRect.updateToRect(_pixelGuyBounds);
            _rectTransition.toRect.updateToRect(AppLayout.updateLayoutRectBoundsToState("loaderPixelGuy", "transitionTo"));
            _rectTransition.toRect.width *= .3;
            _rectTransition.toRect.height *= .3;
            _rectTransition.setEasings(UnitEasing.easeInSine, UnitEasing.easeOutSine);
            _rectTransition.init(_pixelGuyBounds);
            _unitAnimator.start(2000, updateEndSequenceAnimation, callback);
        };

        var updateEndSequenceAnimation = function(normal){
            _context.fillStyle = appConfig.appBgColor;
            _context.fillRect(0, 0, _canvas.width, _canvas.height);
            renderEndSequenceLaptop(MathUtil.smoothstep(normal, 0, .3));
            renderEndSequenceTitle(MathUtil.smoothstep(normal, .35, .7));
            renderEndSequenceButtrock(MathUtil.smoothstep(normal, .7, 1));
            _circles.renderLoaderCirclesCompleteTransition(MathUtil.smoothstep(normal, 0, .8), _context);
        };

        var renderEndSequenceLaptop = function(normal) {
            if(normal===1){
                return;//only render if within screen bounds
            }
            var laptopX = MathUtil.interpolate(UnitEasing.easeInSine(normal), _laptopBounds.x, -_pixelGuyBounds.width);
            var laptopY = MathUtil.interpolate(UnitEasing.easeOutSine(normal), _laptopBounds.y, AppLayout.bounds.height * .1);
            SakriDotNetSpriteSheet.renderFrame("laptop", _context, 2, laptopX, laptopY , _pixelGuyScale);
        };

        var renderEndSequenceTitle = function(normal) {
            if(!normal || normal===1){
                return;//only translate if normal is changing
            }
            var translateX = MathUtil.interpolate(UnitEasing.easeInSine(normal), 0, _pixelGuyBounds.width);
            var translateY = MathUtil.interpolate(UnitEasing.easeOutSine(normal), 0, -_pixelGuyBounds.y);
            _title.style.transform = "translate(" + translateX + "px ," + translateY + "px)";
        };

        var renderEndSequenceButtrock = function(normal) {
            if(normal){
                _rectTransition.updateToProgressNormal(normal);
            }
            var scale = _pixelGuyScale = Math.floor(Math.min(_pixelGuyBounds.width  / ButtrockManager.unscaledWidth, _pixelGuyBounds.height  / ButtrockManager.unscaledHeight));
            ButtrockManager.render(_context, _pixelGuyBounds.x, _pixelGuyBounds.y, scale, .1);
        };

    }
}());

//=================================================================
//===============::SAKRI DOT NET LOADER CONTROLLER::===============
//=================================================================

(function() {

    window.SakriDotNetLoaderController = function(completeCallBack) {

        var _loader = new SakriDotNetLoader(), _images;

        this.start = function(){
            _loader.init();
            updateLoaderCircles();
            updateImagesLoad();
        };

        var updateLoaderCircles = function(){
            _loader.updateCircles(appConfig.colorPalette, document.body.querySelectorAll("section, article").length);
        };

        var updateImagesLoad = function(){
            var completed = 0;
            updateLoaderCircles();
            _images = document.querySelectorAll("img");
            for(var i=0; i < _images.length; i++){
                completed += (_images[i].complete ? 1 : 0);
            }
            _loader.render(completed / _images.length);
            if(completed >= _images.length && _loader.circlesIntroComplete() ){
                _loader.playExitAnimation(completeCallBack);
                return;
            }
            window.requestAnimationFrame(updateImagesLoad);
        };
    }
}());


//=================================================================
//==========::SAKRI DOT NET LOADER TEST CONTROLLER::===============
//=================================================================

(function() {

    //loads with mock progress, loops for all eternity (until stopped)
    window.SakriDotNetLoaderTestController = function() {

        var _loader = new SakriDotNetLoader(), _animNormal, _callback;

        this.start = function(){
            _animNormal = 0;
            _callback = this.start.bind(this);
            _loader.init();
            _loader.updateCircles(appConfig.colorPalette, Math.round(MathUtil.getRandomNumberInRange(4, 12)));
            updateProgress();
        };

        var updateProgress = function(){
            _animNormal += Math.random() * .01;
            if(_animNormal > 1 && _loader.circlesIntroComplete()){
                //console.log("SakriDotNetLoaderTestController.updateProgress() COMPLETE ");
                _loader.playExitAnimation(_callback);
                return;
            }
            _loader.render(_animNormal);
            window.requestAnimationFrame(updateProgress);
        };

    }
}());