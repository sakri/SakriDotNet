/**
 * Created by Sakri Rosenstrom on 15-06-18
 * DEPENDENCIES : MathUtil, Rectangle, Sprites, UnitAnimator, TangleUI, Transition
 *
 * Contains:
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


//======================================================
//===============::SAKRI DOT NET LOADER::===============
//======================================================

(function() {

    window.SakriDotNetLoader = function() {

        //PRIVATE VARIABLES
        var _canvas, _context,
            _pixelGuyScale,
            _circlesBounds = new Rectangle(),
            _circlesEmitter = {x:0, y:0},
            _circles = new LoaderCircles(),
            _title,
            _animations = {},
            _exitAnimator = new UnitAnimator();

        //PUBLIC API

        this.init = function(label){
            _canvas = CanvasUtil.createCanvas(document.body, AppConfig.zIndexLoaderCanvas);
            resizeCanvas();
            calculateDynamicLayout();
            createLoaderTitle(label);
            playIntroAnimation();
        };

        this.resize = function(){
            resizeCanvas();
            calculateDynamicLayout();
            resizeTitle();
            resizeAnimations();
        };

        this.updateCircles = function(colors, numCircles){
            _circles.updateCircles(colors, numCircles, _circlesBounds, _circlesEmitter);
        };

        this.circlesIntroComplete = function(){
            return _circles.introComplete();
        };

        this.render = function(normal){
            render(normal);
        };

        this.playExitAnimation = function(callback){
            playExitAnimation(callback);
        };

        //Private methods

        var calculateDynamicLayout = function(){
            //adjust "pixel guy" layout bounds to spritesheet proportions
            var adjustedBounds = new Rectangle();
            adjustedBounds.updateToRect(TangleUI.getRect("loaderPixelGuy"));
            _pixelGuyScale = Math.floor(Math.min(adjustedBounds.width  / PixelGuyTypingSprite.unscaledWidth, adjustedBounds.height  / PixelGuyTypingSprite.unscaledHeight));
            adjustedBounds.width = PixelGuyTypingSprite.unscaledWidth * _pixelGuyScale;
            adjustedBounds.height = PixelGuyTypingSprite.unscaledHeight * _pixelGuyScale;
            adjustedBounds.x = Math.round(TangleUI.getRect().centerX() - adjustedBounds.width * .5);
            adjustedBounds.y = Math.round(TangleUI.getRect().centerY() - adjustedBounds.height * .5);
            TangleUI.setRect(adjustedBounds, "loaderPixelGuy", "default");

            //calculate circles bounds and emitter
            _circlesBounds.update(
                Math.round(adjustedBounds.x + adjustedBounds.width * .1),
                Math.round(adjustedBounds.y + adjustedBounds.height * 1.6),
                Math.floor(adjustedBounds.width * .8),
                Math.floor(adjustedBounds.height * .1)
            );

            _circlesEmitter.x = Math.round(adjustedBounds.x + adjustedBounds.width * .25);
            _circlesEmitter.y = Math.round(adjustedBounds.bottom() - adjustedBounds.height * .2);

            //adjust "title" bounds height to adjusted "pixel guy" dimensions
            var titleBounds = TangleUI.getRect("loaderTitle");
            titleBounds.height = adjustedBounds.height * .6;
            adjustedBounds.updateToRect(titleBounds);
            TangleUI.setRect(adjustedBounds, "loaderTitle", "default");

            //adjust "buttrock" bounds to spritesheet proportions
            adjustedBounds.updateToRect(TangleUI.getRect("loaderPixelGuy"));
            adjustedBounds.update(
                Math.round(adjustedBounds.x + adjustedBounds.width * .5),
                Math.round(adjustedBounds.y - adjustedBounds.height * .4),
                ButtrockManager.unscaledWidth * _pixelGuyScale,
                ButtrockManager.unscaledHeight * _pixelGuyScale
            );
            if(adjustedBounds.right() > TangleUI.getRect().width){
                adjustedBounds.x = TangleUI.getRect().width - adjustedBounds.width;
            }
            TangleUI.setRect(adjustedBounds, "loaderButtrock", "default");
        };

        var resizeCanvas = function(){
            _context = CanvasUtil.setLayoutBounds(_canvas, TangleUI.getRect());
            CanvasUtil.enablePixelArtScaling(_context);
        };

        var createLoaderTitle = function(label){
            _title = document.createElement("h1");
            _title.style.color = "#222222";//needs to match dark pixels in sprites.js
            _title.style.position = "absolute";
            _title.style.overflow = "hidden";
            _title.style.textAlign = "center";
            _title.style.margin =  _title.style.padding =  _title.style.borderWidth = "0";
            _title.style.zIndex = AppConfig.zIndexLoaderTitle;
            resizeTitle();
            _title.innerHTML = label;
            document.body.appendChild(_title);
        };

        var resizeTitle = function(){
            var bounds = TangleUI.getRect("loaderTitle");
            _title.style.fontSize = Math.round(bounds.height * .7) + "px";
            _title.style.width = bounds.width + "px";
            _title.style.height = bounds.height + "px";
            _title.style.left = bounds.x + "px";
            _title.style.top = bounds.y + "px";
        };


        //ANIMATIONS

        var resizeAnimations = function(){
            if(_exitAnimator.isAnimating()){
                _animations.title = TransitionStore.getTangleUITransition("loaderTitleOut");
                _animations.laptop = TransitionStore.getTangleUITransition("loaderLaptopOut");
                _animations.buttrock = TransitionStore.getTangleUITransition("loaderButtrockOut");
            }else{
                _animations.pixelGuy = AnimationStore.getTangleUIAnimation("loaderPixelGuy", "loaderPixelGuyIn");
                _animations.title = AnimationStore.getTangleUIAnimation("loaderTitle","loaderTitleIn", updateTitleAnimation);
            }
        };

        var playIntroAnimation = function(){
            _animations.pixelGuy = AnimationStore.getTangleUIAnimation("loaderPixelGuy", "loaderPixelGuyIn");
            _animations.title = AnimationStore.getTangleUIAnimation("loaderTitle","loaderTitleIn", updateTitleAnimation);
            _animations.title.play();
            _animations.pixelGuy.play();
        };

        //Move to Transition.js .  CSSTransitionAnimation() or so
        var updateTitleAnimation = function(normal, rect){
            //console.log("Loader.updateTitleAnimation()", rect.y , TangleUI.getRect("loaderTitle").y);
            TransitionCSSUtil.setTranslate(_title, 0, rect.y - TangleUI.getRect("loaderTitle").y);
        };

        var render = function(normal){
            _context.fillStyle = AppConfig.appBgColor;
            _context.fillRect(0, 0, _canvas.width, _canvas.height);
            var bounds = _animations.pixelGuy.getRectangle();
            PixelGuyTypingManager.render(_context, bounds.x, bounds.y, _pixelGuyScale, normal);
            if(!_animations.pixelGuy.isAnimating()){
                _circles.renderLoading(normal, _context);//don't render during intro sequence
            }
        };

        //Set of transitions managed by one animator
        var playExitAnimation = function(callback){
            var bounds = _animations.pixelGuy.getRectangle();
            _circles.prepareExit(bounds.x, -bounds.centerY());
            _animations.title = TransitionStore.getTangleUITransition("loaderTitleOut");
            _animations.laptop = TransitionStore.getTangleUITransition("loaderLaptopOut");
            _animations.buttrock = TransitionStore.getTangleUITransition("loaderButtrockOut");
            _exitAnimator.start(1500, renderExiting, callback);
        };

        var renderExiting = function(normal){
            _context.fillStyle = AppConfig.appBgColor;
            _context.fillRect(0, 0, _canvas.width, _canvas.height);
            renderEndSequenceLaptop(MathUtil.smoothstep(normal, 0, .3));
            renderEndSequenceTitle(MathUtil.smoothstep(normal, .35, .7));
            renderEndSequenceButtrock(MathUtil.smoothstep(normal, .7, 1));
            _circles.renderLoaderCirclesCompleteTransition(MathUtil.smoothstep(normal, 0, .8), _context);
        };

        var renderEndSequenceLaptop = function(normal) {
            if(normal < 1){
                _animations.laptop.updateToNormal(normal);
                var bounds = _animations.laptop.rectangle;
                SakriDotNetSpriteSheet.renderFrame("laptop", _context, 2, bounds.x , bounds.y , _pixelGuyScale);
            }
        };

        var renderEndSequenceTitle = function(normal) {
            if(normal > 0 && normal < 1){
                _animations.title.updateToNormal(normal);
                var bounds = TangleUI.getRect("loaderTitle");
                var x = _animations.title.rectangle.x - bounds.x;
                var y = _animations.title.rectangle.y - bounds.y;
                _title.style.transform = "translate(" + x + "px, " + y + "px)";
            }
        };

        var renderEndSequenceButtrock = function(normal) {
            _animations.buttrock.updateToNormal(normal);
            var bounds = _animations.buttrock.rectangle;
            var scale = Math.floor(Math.min(bounds.width  / ButtrockManager.unscaledWidth, bounds.height  / ButtrockManager.unscaledHeight));
            ButtrockManager.render(_context, bounds.x, bounds.y, scale, .1);
        };

    }
}());

//=================================================================
//===============::SAKRI DOT NET LOADER CONTROLLER::===============
//=================================================================

(function() {

    window.SakriDotNetLoaderController = function(completeCallBack) {

        var _loader = new SakriDotNetLoader(), _images;

        this.start = function(label){
            _loader.init(label);
            updateLoaderCircles();
            updateImagesLoad();
        };

        this.resize = function(){
            _loader.resize();
        };

        var updateLoaderCircles = function(){
            _loader.updateCircles(AppConfig.colorPalette, document.body.querySelectorAll("section, article").length);
        };

        var updateImagesLoad = function(){
            var completed = 0;
            updateLoaderCircles();
            _images = document.querySelectorAll("img");
            for(var i=0; i < _images.length; i++){
                completed += (_images[i].complete ? 1 : 0);
            }
            _loader.render(completed / _images.length);
            if(_images.length && completed >= _images.length && _loader.circlesIntroComplete() ){
                console.log("images load complete, loaded : ", completed, " / ",  _images.length);
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

        this.start = function(label){
            _animNormal = 0;
            _callback = this.start.bind(this);
            _loader.init(label);
            _loader.updateCircles(AppConfig.colorPalette, Math.round(MathUtil.getRandomNumberInRange(4, 12)));
            updateProgress();
        };

        this.resize = function(){
            _loader.resize();
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