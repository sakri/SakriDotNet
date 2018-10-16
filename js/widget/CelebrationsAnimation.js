/**
 * DEPENDENCIES:
 * utils MathLib, Rectangle
 */

(function() {

    window.CelebrationsAnimation = function(colors, completeCallback){

        //public API

        this.play = function(canvas, avatarBounds){
            if(!canvas){
                console.log("CelebrationsAnimation.play() skipping, no canvas provided");
                return;
            }

            _canvas = canvas;
            _context = canvas.getContext("2d");
            _confettiCanvas.width = _confettiCanvas.height = _confettiCanvasSize;
            _bowDownCount = _buttrockCount = 0;
            resize();
            transitionIn(avatarBounds);
        };

        //For demonstrations purposes only, website closes stats module on resize
        this.resize = function(){
            resize();
        };

        this.stop = function(){
            stop();
        };

        //private properties and methods

        var _confetti, _colors,
            _introAnimation,
            _confettiCanvasSize = 60,
            _canvas, _context,
            _confettiCanvas = document.createElement("canvas"),
            _bowDownBounds = new Rectangle(),
            _bowDownScale,
            _buttRockBounds = new Rectangle(),
            _buttrockScale,
            _confetti = new PixelConfetti(colors, 1500, 4000, updateConfettiCallback);

        var resize = function(){

            _bowDownScale = Math.floor(_canvas.width * .8 / BowdownManager.unscaledWidth);
            _bowDownBounds.width = BowdownManager.unscaledWidth * _bowDownScale;
            _bowDownBounds.height = BowdownManager.unscaledHeight * _bowDownScale;
            _bowDownBounds.x = Math.round(_canvas.width * .5 - _bowDownBounds.width * .5);
            _bowDownBounds.y = Math.round(_canvas.height * .5 - _bowDownBounds.height * .5);

            _buttrockScale = Math.floor(_canvas.width * .6 / ButtrockManager.unscaledWidth);
            _buttRockBounds.width = ButtrockManager.unscaledWidth * _buttrockScale;
            _buttRockBounds.height = ButtrockManager.unscaledHeight * _buttrockScale;
            _buttRockBounds.x = Math.round(_canvas.width * .65 - _buttRockBounds.width * .5);
            _buttRockBounds.y = Math.round(_canvas.height * .5 - _buttRockBounds.height * .5);

            //TODO: SOMETHING COOLER
            _context.font = "bold " + Math.round(_bowDownBounds.height * .2) + "px Helvetica,Arial,sans-serif";
            _context.textBaseline = "top";//top, bottom, middle, alphabetic, hanging
            _context.textAlign = "center";

        };

        var transitionIn = function(avatarBounds){
            BowdownManager.completeCallback = bowDownCompleteCallback;
            ButtrockManager.completeCallback = buttRockCompleteCallback;
            var toRect = new Rectangle(
                Math.round(_canvas.width/2 - _bowDownBounds.height/2),
                Math.round(_canvas.height/2 - _bowDownBounds.height/2),
                _bowDownBounds.height, _bowDownBounds.height
            );
            var transition = TransitionStore.getTransition("celebrateZoomAvatar", avatarBounds, toRect, {duration : 1200, easing:UnitEasing.easeInOutSine});
            _introAnimation = AnimationStore.getAnimation("celebrateZoomAvatar", transition, updateAvatarIntro, avatarIntroComplete);
            _introAnimation.play()
        };


        var updateAvatarIntro = function(normal, rect){
            _context.clearRect(0, 0,_canvas.width, _canvas.height);
            var scale = Math.min(rect.width / PixelGuyHeadSprite.unscaledWidth, rect.height/ PixelGuyHeadSprite.unscaledHeight) ;
            PixelGuyHeadSprite.renderAvatar(_canvas.getContext("2d"), rect.x, rect.y, scale, normal);
        };

        var avatarIntroComplete = function(){
            _confetti.updateCanvas(_confettiCanvas);
            _confettiIntervalId = setInterval(addConfetti, 200 + Math.floor(Math.random() * 400));
        };

        var _bowDownCount = 0, _buttrockCount = 0;
        var bowDownCompleteCallback = function(){
            _bowDownCount++;
        };
        var buttRockCompleteCallback = function(){
            _buttrockCount++;
        };

        function updateConfettiCallback(){
            _context.clearRect(0,0,_canvas.width, _canvas.height);
            if(_bowDownCount < 2){
                BowdownManager.render(_context, _bowDownBounds.x, _bowDownBounds.y, _bowDownScale, .1);
            }else{
                ButtrockManager.render(_context, _buttRockBounds.x, _buttRockBounds.y, _buttrockScale, .2);
                if(_buttrockCount > 15){
                    if(completeCallback){
                        completeCallback();
                    }
                    return;
                }
                _context.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                _context.fillText("YOU ROCK!", _bowDownBounds.centerX() , _buttRockBounds.bottom());
            }
            _context.drawImage(_confettiCanvas, 0, 0, _confettiCanvas.width, _confettiCanvas.height,
                0, 0, _canvas.width, _canvas.height);
        };

        var _confettiIntervalId = -1;
        function addConfetti(event){
            var emitterX = Math.round(_confettiCanvas.width * .5);
            var emitterY = Math.round(_confettiCanvas.height * .4);
            _confetti.addParticles( Math.floor(MathUtil.getRandomNumberInRange(40, 80)), emitterX, emitterY);
        };

        function stop(){
            if(_introAnimation){
                _introAnimation.stop();
            }
            clearInterval(_confettiIntervalId);
            _confettiIntervalId = -1;
            if(_confetti){
                _confetti.stop();
            }
        };



    };
}());