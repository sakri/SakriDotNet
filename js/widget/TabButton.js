(function() {

    window.TabButton = function(){

        //Public API

        this.init = function(value, parent, zIndex, rightAlign){
            createButton(parent, zIndex);
            calculateLayout(value, rightAlign);
            return _button;
        };

        this.show = function(duration, clickCallback){
            _clickCallback = clickCallback;
            _button.style.display = "block";
            animateIn(duration);
        };

        this.hide = function(duration){
            animateOut(duration);
        };

        this.stop = function(){
            _animator.stop();
            _button.style.display = "none";
        };

        //Private api

        var _button, _clickCallback, _defaultBounds = new Rectangle(), _fromBounds = new Rectangle(),
            _transition = new RectangleTransition(), _animator = new RectangleTransitionAnimator();

        //TODO: move elsewhere! HtmlUtils or so? Also, revisit, solution isn't bullet proof...
        var _measuredWidth = 0, _lastMeasuredString = "", _lastMeasuredFontSize = 0;
        var measureTextWidth = function(string, fontSize){
            if(string !== _lastMeasuredString || fontSize !== _lastMeasuredFontSize){
                var _textMeasureSpan = document.createElement("span");
                _button.appendChild(_textMeasureSpan);
                //_textMeasureSpan.style.visibility = "hidden";
                _textMeasureSpan.style.whiteSpace = "nowrap";
                _textMeasureSpan.style.fontSize = fontSize + "px";
                _textMeasureSpan.innerHTML = string;
                //console.log("measureTextWidth() fs:", fontSize,  _textMeasureSpan.innerHTML , _textMeasureSpan.offsetWidth, "x6");
                _measuredWidth = _textMeasureSpan.offsetWidth;
                _textMeasureSpan.innerHTML = "";
                _button.removeChild(_textMeasureSpan);
                _textMeasureSpan = null;
                _lastMeasuredString = string;
                _lastMeasuredFontSize = fontSize;
            }
            return _measuredWidth;
        };

        var clickHandler = function(){
            _clickCallback();
        };

        var createButton = function(parent, zIndex){
            if(!_button){
                _button = document.createElement("button");
                _button.addEventListener ("click", clickHandler);//needs to be removed?
                _button.classList.add("cardCloseButton");
            }
            _button.style.zIndex = zIndex;
            parent.appendChild(_button);//meh
        };

        var calculateLayout = function(value, rightAlign){
            _defaultBounds.y = 0;
            _defaultBounds.height = Math.round(TangleUI.getRect("menuButton").height * .3);
            var fontSize = Math.round(_defaultBounds.height * .6);
            //console.log();
            _defaultBounds.width = measureTextWidth(value, fontSize) + _defaultBounds.height * 2;
            //console.log("TabButton.calculateLayout()", fontSize, _defaultBounds.width);
            var spacer = TangleUI.bounds.smallerSide() * .05;

            //not the most flexible solution, ok for now.
            if(rightAlign){
                _defaultBounds.x = Math.round(TangleUI.bounds.right() - spacer - _defaultBounds.width);
                _fromBounds.x = Math.round(TangleUI.bounds.width * 1.05);
            }else{
                _defaultBounds.x = spacer;
                _fromBounds.x = Math.round(_defaultBounds.width * -1.1);
            }

            var borderRadius = Math.round(_defaultBounds.height * .95);
            _button.style.borderRadius = "0px 0px " + borderRadius + "px " + borderRadius + "px";
            TransitionCSSUtil.showElement(_button, true, _defaultBounds);
            _button.style.fontSize = fontSize + "px";
            _button.innerHTML = value;
            _button.style.display = "none";
        };

        var animateIn = function(duration){
            _button.style.display = "block";
            _transition.updateTargets(_fromBounds, _defaultBounds);
            _transition.init({duration:duration, easingFunction:UnitEasing.easeOutSine});
            //console.log("TabButton.animateIn()", duration, _transition.fromRect.toString(), _transition.toRect.toString(), _transition.rectangle.toString());
            _animator.setCallbacks(animationUpdate);
            _animator.setTransition(_transition);
            _animator.play();
        };

        var animateOut = function(duration){
            _button.style.display = "block";
            _animator.setCallbacks(animationUpdate, animateOutComplete);
            _animator.playReverse();
        };

        //TODO: create class: RectangleTransitionAnimator with HTML target
        var animationUpdate = function(normal, rect){
            TransitionCSSUtil.setTransitionTranslate(_button, rect, _defaultBounds);
        };

        var animateOutComplete = function(){
            _button.style.display = "none";
        };

    };
}());