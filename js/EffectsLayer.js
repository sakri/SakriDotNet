/**
 * DEPENDENCIES:
 * MathLib, Rectangle
 *
 * stats module button (show/hide)
 * stats progress bar in module button
 * "your stats" prompt
 * transition from button to stats module view
 * transition from stats mod to button view
 * victory animation
 *
 */


(function() {

    window.EffectsLayer = function(showStatsModuleCallback, backButtonUrl) {

        //PUBLIC API

        var resize = function(){
            initCanvas();
            if(AppLayout.bounds.width == _canvas.width && AppLayout.bounds.height == _canvas.height){
                return;
            }
            _canvas.width = AppLayout.bounds.width;
            _canvas.height = AppLayout.bounds.height;
            _context = _canvas.getContext("2d");
            _context.imageSmoothingEnabled = false;
            _context.mozImageSmoothingEnabled = false;
            _context.webkitImageSmoothingEnabled = false;
            _context.msImageSmoothingEnabled = false;
            calculateButtonLayout();
        };

        this.show = function(value){
            if(backButtonUrl){
                _canvas.style.display = "none";//TODO: shit hack, refactor
                return;
            }
            var normal = AppData.getAchievementNormal();
            PixelGuyHeadSprite.renderAvatar(_context, _avatarBounds.x, _avatarBounds.y, _avatarScale, normal);
            this.updateStatsProgress(normal);
            _canvas.style.display = value ? "block" : "none";
            var shadowLength = Math.round(_avatarScale * .3);
            var dropShadow = "drop-shadow(" + -shadowLength + "px " + -shadowLength + "px " + Math.round(shadowLength * 2) + "px #AAAAAA)";//x, y, blur, spread, color
            _canvas.style.setProperty("filter", dropShadow);
            _canvas.style.setProperty("-webkit-filter", dropShadow);
        };

        this.showStatsButton = function(){
            resize();
            this.show(true);
            _canvas.style.left = _canvas.width - _buttonBounds.width + "px";
            _canvas.style.top = _canvas.height - _buttonBounds.height + "px";
            //debugLayout();

        };

        this.updateStatsProgress = function(normal){
            if(backButtonUrl){
                _canvas.style.display = "none";//TODO: shit hack, refactor
                return;
            }
            _context.fillStyle = "#000000";//or get dark color from??? AppConfig?
            _context.fillRect(_progressBarBounds.x, _progressBarBounds.y, _progressBarBounds.width, _avatarScale * 3);
            _context.fillStyle = "#FFFFFF";//or get light color from??? AppConfig?
            _context.fillRect(_avatarScale, _progressBarBounds.y + _avatarScale, _progressBarBounds.width - _avatarScale * 2, _avatarScale);
            _context.fillStyle = appConfig.themeColor;
            _context.fillRect(_avatarScale, _progressBarBounds.y + _avatarScale, (_progressBarBounds.width - _avatarScale * 2) * normal, _avatarScale);
        };

        this.promptStats = function(){
            if(backButtonUrl){
                _canvas.style.display = "none";//TODO: shit hack, refactor
                return;
            }
            SpeechBubbleManager.show(_context, _promptBounds.x, _promptBounds.y, _promptScale);
        };

        this.showVictory = function(){

        };

        this.closeVictory = function(){

        };

        this.exitStatsView = function(){

        };

        //PRIVATE PROPERTIES & METHODS
        var _avatarScale, _promptScale, _canvas, _context, _buttonBounds = new Rectangle(),
        _promptBounds = new Rectangle(), _progressBarBounds = new Rectangle(), _avatarBounds = new Rectangle();

        var calculateButtonLayout = function(){
            if(_canvas.width > _canvas.height){
                _buttonBounds.width = Math.round(_canvas.height * .3);
                _buttonBounds.height = Math.round(_buttonBounds.width * .75);
            }else{
                _buttonBounds.height = Math.round(_canvas.width * .25);
                _buttonBounds.width = Math.round(_buttonBounds.height * 1.4);
            }
            _avatarBounds.width = _avatarBounds.height = Math.floor(_buttonBounds.width * .4);
            _avatarBounds.x = Math.floor(_buttonBounds.right() - _avatarBounds.width);
            _avatarBounds.y = Math.floor(_buttonBounds.bottom() - _avatarBounds.height);

            var ss = SakriDotNetSpriteSheet.getSpriteSheetData("head");
            _avatarScale = Math.floor(_avatarBounds.height * 2 / ss.height);

            var ss = SakriDotNetSpriteSheet.getSpriteSheetData("yourStats");
            _promptScale = Math.floor(Math.min(_buttonBounds.width/ss.width , (_avatarBounds.y - _avatarScale) / ss.height));
            _promptBounds.update(_buttonBounds.right() - _avatarScale - ss.width * _promptScale,
                                _avatarBounds.y - _avatarScale - _promptScale * ss.height,
                                ss.width * _promptScale, _promptScale * ss.height);
            _progressBarBounds.update(_buttonBounds.x, _buttonBounds.height - _avatarScale * 4,
                                        _avatarBounds.x - _avatarScale, _avatarScale * 3);

        };

        var debugLayout = function(){
            _context.fillStyle = "#AAAAAA";
            _context.fillRect(_buttonBounds.x, _buttonBounds.y, _buttonBounds.width, _buttonBounds.height);
            _context.fillStyle = "#FF0000";
            _context.fillRect(_promptBounds.x, _promptBounds.y, _promptBounds.width, _promptBounds.height);
            _context.fillStyle = "#00FF00";
            _context.fillRect(_progressBarBounds.x, _progressBarBounds.y, _progressBarBounds.width, _progressBarBounds.height);
            _context.fillStyle = "#0000FF";
            _context.fillRect(_avatarBounds.x, _avatarBounds.y, _avatarBounds.width, _avatarBounds.height);
        };

        var initCanvas = function(){
            if(_canvas){
                return;
            }
            _canvas = document.createElement("canvas");
            document.body.appendChild(_canvas);
            _canvas.style.position = "fixed";
            _canvas.style.zIndex = appConfig.effectsLayerZ;
            _canvas.addEventListener("click", effectsLayerClickHandler);
        };

        var effectsLayerClickHandler = function(){
            //TODO: prevent double clicks, would be trivial with _unitAnimator
            SpeechBubbleManager.hide();
            _canvas.style.setProperty("filter", "");
            _canvas.style.setProperty("-webkit-filter", "");
            _context.clearRect(0,0,_canvas.width, _canvas.height);
            _transitionToStatsNormal = 0;
            _transitionHeadNormal = AppData.getAchievementNormal();
            _canvas.style.left = _canvas.style.top = "0px";
            _scaleTransition.from = _avatarScale;
            _scaleTransition.to = Math.floor(Math.min(AppLayout.bounds.width / PixelGuyHeadSprite.unscaledWidth, AppLayout.bounds.height / PixelGuyHeadSprite.unscaledHeight));
            _xTransition.from = AppLayout.bounds.width - _buttonBounds.x + _avatarBounds.x;
            _xTransition.to = Math.floor(AppLayout.bounds.centerX() - PixelGuyHeadSprite.unscaledWidth * _scaleTransition.to * .5);
            _yTransition.from = AppLayout.bounds.height - _buttonBounds.y + _avatarBounds.y;
            _yTransition.to = Math.floor(AppLayout.bounds.centerY() - PixelGuyHeadSprite.unscaledHeight * _scaleTransition.to * .5);
            transitionToStatsView1();
        };

        var _transitionToStatsNormal, _transitionHeadNormal, _scaleTransition = {}, _xTransition = {}, _yTransition = {};

        var renderButtonTransition = function(normal){
            var x = Math.round(MathUtil.interpolate(normal, _xTransition.from , _xTransition.to ));
            var y = Math.round(MathUtil.interpolate(normal, _yTransition.from , _yTransition.to ));
            var scale = Math.floor(MathUtil.interpolate(normal, _scaleTransition.from , _scaleTransition.to ));
            PixelGuyHeadSprite.renderAvatar(_context, x, y, scale, _transitionHeadNormal);
        }

        var transitionToStatsView1 = function(){
            renderButtonTransition(UnitEasing.easeOutSine(_transitionToStatsNormal));
            _transitionToStatsNormal += .025;
            if(_transitionToStatsNormal <= 1){
                requestAnimationFrame(transitionToStatsView1);
            }else{
                _transitionToStatsNormal = 0;
                _scaleTransition.from = _scaleTransition.to;
                _scaleTransition.to *= 4;
                _xTransition.from = _xTransition.to;
                _xTransition.to = Math.floor(_xTransition.to - ((PixelGuyHeadSprite.unscaledWidth - 1) * _scaleTransition.to) * .5);
                _yTransition.from = _yTransition.to;
                _yTransition.to = Math.floor(_yTransition.to - ((PixelGuyHeadSprite.unscaledHeight - 1) * _scaleTransition.to) * .5);
                if(showStatsModuleCallback){
                    showStatsModuleCallback();
                }
                transitionToStatsView2();
            }
        };

        var transitionToStatsView2 = function(){
            renderButtonTransition(UnitEasing.easeInSine(_transitionToStatsNormal));
            _transitionToStatsNormal += .03;
            if(_transitionToStatsNormal <= 1){
                requestAnimationFrame(transitionToStatsView2);
            }else{
                transitionToStatsViewCompleteHandler();
            }
        };

        var transitionToStatsViewCompleteHandler = function(){
            _context.clearRect(0,0,_canvas.width, _canvas.height);
            _canvas.style.display = "none";
        };

        var expandStatsButton = function(){

        };





    }
}());