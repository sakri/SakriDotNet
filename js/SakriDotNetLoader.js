/**
 * DEPENDENCIES:
 * utils
 */

/**
 * Created by Sakri Rosenstrom on 15-06-18
 * DEPENDENCIES : MathUtil, Rectangle, Sprites
 *
 * Contains:
 *
 *      LoaderCircles:
 *      - manages coloured circles in loader
 *
 *      SakriDotNetLoader
 *      - creates canvas, manages pixel guy, circles and title
 *
 *      SakriDotNetLoaderController
 *      - reads html page, observes load, manages Loader
 *
 *      SakriDotNetLoaderTestController
 *      - mocks LoaderController behaviour

 */


//==============================================
//=============::LOADER CIRCLES::===============
//==============================================

(function(){

    window.LoaderCircles = function(){

        var _circles,
            _circlesAnimProgress = 0,
            _circlesAnimMax = 100;

        //TODO: needs some cleanup. startX used to be param : emitterX (some context)
        this.init = function(colors, numCircles, bounds, emitterX, emitterY){

            if(_circles && _circles.length > 0 && _circles.length == numCircles){
                return;
            }

            _circles= [];
            var circleXIncrement = bounds.width / numCircles;
            var radius = Math.min(Math.round(circleXIncrement * .35), bounds.height);
            for(var i=0; i < numCircles; i++){
                _circles[i] = {
                    startX : emitterX,
                    endX : Math.round(bounds.x + circleXIncrement * i + circleXIncrement * .5),
                    startY : emitterY,
                    endY : bounds.y,
                    radius : radius,
                    color : colors[i % colors.length],
                    animNormal : 0
                };
                _circles[i].currentX = _circles[i].startX;
                _circles[i].currentY = _circles[i].startY;
            }
        };

        this.renderLoaderCircles = function(normal, context){
            var renderCount = Math.round(normal * _circles.length);
            var i, circle, animNormal, radiusNormal, radius;

            var circleScaleDurationNormal = .6;//each circles scaleInOut duration, out of total duration
            var circleScaleDurationNormalSpacer = (1 - circleScaleDurationNormal) / renderCount;
            var circleSpacing = 1 / renderCount;

            for(i=0; i<renderCount; i++){
                circle = _circles[i];
                if(!circle){
                    console.log("renderLoaderCircles no circle : ", i, renderCount, _circles.length, normal, "TODO: Remove");
                    return;
                }
                circle.animNormal = Math.min(circle.animNormal + .03, 1)
                animNormal = UnitEasing.easeOutSine(circle.animNormal, 0, 1, 1);
                circle.currentX = MathUtil.interpolate(animNormal, circle.startX, circle.endX);
                circle.currentY = MathUtil.interpolate(animNormal, circle.startY, circle.endY);
                context.fillStyle = circle.color;

                radiusNormal = MathUtil.smoothstep(
                    _circlesAnimProgress / 100,
                    i * circleScaleDurationNormalSpacer,
                    i * circleScaleDurationNormalSpacer + circleSpacing * 2
                );
                radius = circle.radius + Math.sin(radiusNormal * Math.PI) * (circle.radius * .4);

                context.beginPath();
                if(i == renderCount - 1){
                    var angle = Math.PI * _circlesAnimProgress / 100;
                    context.arc(circle.currentX, circle.currentY, radius, Math.PI - angle, Math.PI + angle);
                }else{
                    context.arc(circle.currentX, circle.currentY, radius, 0, MathUtil.PI2);
                }
                context.fill();
                context.closePath();
            }
            _circlesAnimProgress++;
            _circlesAnimProgress %= _circlesAnimMax;
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
            var i, circle, animNormal, smoothStepIncrement = (1 / _circles.length);
            for(i=0; i<_circles.length; i++){
                circle = _circles[i];
                animNormal = MathUtil.smoothstep(normal, smoothStepIncrement * i, 1);
                circle.currentX = MathUtil.interpolate(normal, circle.startX, circle.endX);
                circle.currentY = MathUtil.interpolate(animNormal, circle.startY, circle.endY);
                context.fillStyle = circle.color;
                context.beginPath();
                context.arc(circle.currentX, circle.currentY, circle.radius, 0, MathUtil.PI2);
                context.fill();
                context.closePath();
            }
        };

        this.introComplete = function(){
            return _circles && _circles.length && _circles[_circles.length - 1].animNormal == 1;
        };

    };
}());


//======================================================
//===============::SAKRI DOT NET LOADER::===============
//======================================================

(function() {

    window.SakriDotNetLoader = function(index) {

        //PRIVATE VARIABLES
        var _canvas, _context,
            _smileyBounds = new Rectangle(),
            _smileyScale,
            _circles,
            _title,
            _endAnimNormal;


        //PUBLIC API

        this.init = function(colors, numCircles){
            createLoaderCanvas();
            console.log("SakriDotNetLoader.init()", AppLayout.bounds.width, PixelGuyTypingSprite.unscaledWidth, AppLayout.bounds.height, PixelGuyTypingSprite.unscaledHeight);
            _smileyScale = Math.floor((AppLayout.bounds.isLandscape() ? AppLayout.bounds.height * .25  / PixelGuyTypingSprite.unscaledHeight : AppLayout.bounds.width * .75  / PixelGuyTypingSprite.unscaledWidth));
            _smileyBounds.width = PixelGuyTypingSprite.unscaledWidth * _smileyScale;
            _smileyBounds.height = PixelGuyTypingSprite.unscaledHeight * _smileyScale;
            _smileyBounds.x = Math.round(_canvas.width * .5 - _smileyBounds.width * .5);
            _smileyBounds.y = Math.round(_canvas.height * .5 - _smileyBounds.height * .5);
            createLoaderTitle();
            _circles = new LoaderCircles();
            this.updateCircles(colors, numCircles);
        };

        //rename to something more descriptive (should read like a story)
        this.updateCircles = function(colors, numCircles){
            if(!_circles){
                return;
            }
            var bounds = new Rectangle(
                Math.round(_smileyBounds.x + _smileyBounds.width * .1),
                Math.round(_smileyBounds.y + _smileyBounds.height * 1.6),
                Math.floor(_smileyBounds.width * .8),
                Math.floor(_smileyBounds.height * .1)
            );

            _circles.init(colors, numCircles, bounds, Math.round(_smileyBounds.x + _smileyBounds.width * .25), Math.round(_smileyBounds.bottom() - _smileyBounds.height * .2));
        }

        this.renderLoading = function(normal){
            _context.fillStyle = appConfig.appBgColor;
            _context.fillRect(0, 0, _canvas.width, _canvas.height);//=============== TODO: SHRINK!!! (no need for fullscreen)
            PixelGuyTypingManager.render(_context, _smileyBounds.x, _smileyBounds.y, _smileyScale, normal);
            _circles.renderLoaderCircles(normal, _context);
        };

        this.prepareExit = function(){
            _endAnimNormal = 0;
            _circles.prepareExit(_smileyBounds.x, -_smileyBounds.centerY());
            var buttrockSpriteSheet = SakriDotNetSpriteSheet.getSpriteSheetData("buttrock");
            var rockBounds = new Rectangle(0, 0, buttrockSpriteSheet.width * _smileyScale, buttrockSpriteSheet.height * _smileyScale);
            _smileyBounds.update(
                Math.round(_smileyBounds.x + _smileyBounds.width * .75 - buttrockSpriteSheet.width * _smileyScale * .5),
                Math.round(_smileyBounds.y - _smileyBounds.height * .4),
                rockBounds.width, rockBounds.height
            );
        };

        this.circlesIntroComplete = function(){
            return _circles.introComplete();
        };

        this.renderButtrock = function() {
            _context.fillStyle = appConfig.appBgColor;
            _context.fillRect(0, 0, _canvas.width, _canvas.height);//=============== TODO: SHRINK!!! (no need for fullscreen)
            ButtrockManager.render(_context, _smileyBounds.x, _smileyBounds.y, _smileyScale, .1);
        }

        this.renderEndSequence = function(normal){
            this.renderButtrock();
            var laptopX = -_canvas.width * .75 + Math.round(_canvas.width  * UnitEasing.easeInSine(1 - normal));
            var laptopY = -_canvas.height * .5 + Math.round(_canvas.height  * UnitEasing.easeOutSine(1 - normal));
            SakriDotNetSpriteSheet.renderFrame("laptop", _context, 2, laptopX, laptopY , _smileyScale);

            var translateY = Math.round(MathUtil.smoothstep(normal, .45, 1) * (-_canvas.height * .4));
            var translateX = Math.round(UnitEasing.easeInSine(MathUtil.smoothstep(normal, .45, 1)) * (_canvas.width * .2));
            _title.style.transform = "translate(" + translateX + "px ," + translateY + "px)";

            _circles.renderLoaderCirclesCompleteTransition(normal, _context);
        };

        var _rockExtraTransition = {};
        this.prepareRockExtra = function(){
            _rockExtraTransition.scaleFrom = _smileyScale;
            _rockExtraTransition.scaleTo = _smileyScale * .3;
            _rockExtraTransition.xFrom = _smileyBounds.x;
            _rockExtraTransition.xTo = _canvas.width * 1.1;
            _rockExtraTransition.yFrom = _smileyBounds.y;
            _rockExtraTransition.yTo = _canvas.height * .9;
        };

        this.rockExtra = function(normal){
            var moveNormal = MathUtil.smoothstep(normal, .45, 1);
            _smileyScale = MathUtil.interpolate(moveNormal, _rockExtraTransition.scaleFrom, _rockExtraTransition.scaleTo);
            _smileyBounds.x = MathUtil.interpolate(UnitEasing.easeInSine(moveNormal), _rockExtraTransition.xFrom, _rockExtraTransition.xTo);
            _smileyBounds.y = MathUtil.interpolate(UnitEasing.easeOutSine(moveNormal), _rockExtraTransition.yFrom, _rockExtraTransition.yTo);
            this.renderButtrock();
        };

        //LOADER TITLE
        function createLoaderTitle(){
            _title = document.createElement("h1");
            _title.style.color = "#222222";//needs to match dark pixels in sprites.js
            _title.style.position = "absolute";
            _title.style.overflow = "hidden";
            _title.style.textAlign = "center";
            _title.style.width = "100%";
            _title.style.margin = "0px";
            _title.style.padding = "0px";
            _title.style.zIndex = appConfig.loaderTitleZ;
            _title.style.fontSize = Math.round(_smileyBounds.height * .35) + "px";
            _title.style.top = Math.round(_smileyBounds.y - _smileyBounds.height) + "px";
            _title.innerHTML = "sakri.net";
            document.body.appendChild(_title);
        };

        //LOADER CANVAS
        var createLoaderCanvas = function(){
            if(!_canvas){
                _canvas = document.createElement("canvas");
                _canvas.style.position = "absolute";
                _canvas.style.top = "0px";
                _canvas.style.margin = "0px";
                _canvas.style.padding = "0px";
                _canvas.style.zIndex = appConfig.loaderCanvasZ;
            }
            _canvas.width = document.documentElement.clientWidth;
            _canvas.height = document.documentElement.clientHeight;
            _context = _canvas.getContext("2d");
            _context.imageSmoothingEnabled = false;
            _context.mozImageSmoothingEnabled = false;
            _context.webkitImageSmoothingEnabled = false;
            _context.msImageSmoothingEnabled = false;
            document.body.appendChild(_canvas);
        };

    }
}());

//=================================================================
//===============::SAKRI DOT NET LOADER CONTROLLER::===============
//=================================================================

(function() {

    window.SakriDotNetLoaderController = function(colors) {

        var _loader = new SakriDotNetLoader(),
            _images,
            _endAnimNormal,
            _completeCallBack;

        //PUBLIC API

        this.start = function(completeCallBack){
            //console.log("SakriDotNetLoaderController.start() 1");
            _completeCallBack = completeCallBack;
            _loader.init(colors, document.body.querySelectorAll("section, article").length);
            //console.log("SakriDotNetLoaderController.start() 2 _images :", _images.length, ", sections:", sectionNodes.length);
            updateImagesLoad();
        };

        function updateImagesLoad(){
            var completed = 0;
            _images = document.querySelectorAll("img");
            _loader.updateCircles(colors, document.body.querySelectorAll("section, article").length);
            for(var i=0; i < _images.length; i++){
                completed += (_images[i].complete ? 1 : 0);
            }
            _loader.renderLoading(completed / _images.length);
            if(completed >= _images.length && _loader.circlesIntroComplete() ){
                //console.log("SakriDotNetLoaderController.updateImagesLoad() COMPLETE ");
                _loader.prepareExit();
                _endAnimNormal = 0;
                updateLoadCompleteTransition();
                return;
            }
            window.requestAnimationFrame(updateImagesLoad);
        };

        function updateLoadCompleteTransition(){
            _loader.renderEndSequence(_endAnimNormal);
            if(_endAnimNormal > 1){
                _endAnimNormal = 0;
                _loader.prepareRockExtra();
                return rockExtra();
            }
            _endAnimNormal += .015;
            window.requestAnimationFrame(updateLoadCompleteTransition);
        };

        function rockExtra(){
            _loader.rockExtra(_endAnimNormal);
            _endAnimNormal += .03;
            if(_endAnimNormal > 1){
                return _completeCallBack ? _completeCallBack() : false;
            }
            window.requestAnimationFrame(rockExtra);
        };

    }
}());


//=================================================================
//==========::SAKRI DOT NET LOADER TEST CONTROLLER::===============
//=================================================================

(function() {

    //loads with mock progress, loops for all eternity (until stopped)
    window.SakriDotNetLoaderTestController = function(colors) {

        var _loader = new SakriDotNetLoader(), _animNormal, _callback;

        this.start = function(){
            _animNormal = 0;
            _callback = _callback || this.start.bind(this);
            _loader.init(colors, Math.floor(MathUtil.getRandomNumberInRange(3, 10)));
            updateProgress();
        };

        //LOADER UPDATES AND STATES

        function updateProgress(){
            _animNormal += Math.random() * .01;
            if(_animNormal>1){
                //console.log("SakriDotNetLoaderTestController.updateProgress() COMPLETE ");
                _loader.prepareExit();
                _animNormal = 0;
                updateLoadCompleteTransition();
                return;
            }
            _loader.renderLoading(_animNormal);
            window.requestAnimationFrame(updateProgress);
        };

        function updateLoadCompleteTransition(){
            _loader.renderEndSequence(_animNormal);
            if(_animNormal > 1){
                _animNormal = 0;
                _loader.prepareRockExtra();
                rockExtra();
                return;
            }
            _animNormal += .02;
            window.requestAnimationFrame(updateLoadCompleteTransition);
        };

        function rockExtra(){
            _loader.rockExtra(_animNormal);
            if(_animNormal > 2){
                setTimeout(_callback, 1000);
                return;
            }
            _animNormal += .02;
            window.requestAnimationFrame(rockExtra);
        };

    }
}());