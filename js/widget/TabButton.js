(function() {

    window.TabButton = function(callBack, zIndex){

        //Public API

        //var buttonHeight = (AppLayout.headerBounds.height * .7);
        //var buttonWidth = Math.round(buttonHeight * 2.4);

        this.init = function(value, buttonWidth, buttonHeight, hideXNormal, showXNormal){
            create();
            var borderRadius = Math.round(buttonHeight * .95);
            _button.style.width = buttonWidth + "px";
            _button.style.height = buttonHeight + "px";
            _button.style.borderRadius = "0px 0px " + borderRadius + "px " + borderRadius + "px";
            _button.style.fontSize = Math.round(buttonHeight * .7) + "px";
            _button.innerHTML = value;
            _hideXNormal = hideXNormal;
            _showXNormal = showXNormal;
            return _button;
        };

        this.show = function(value){
            if(!_button){
                console.log("");
                return;
            }
            _button.style.display = "block";
            _animator.stop();
            if(value){
                _button.disabled = false;
                animateIn();
            }else{
                _button.disabled = true;
                animateOut();
            }
        };


        //Private api

        var _button, _hideXNormal, _showXNormal, _animator = new UnitAnimator(), _xFrom, _xTo;

        var create = function(){
            if(_button){
                return;
            }
            _button = document.createElement("button");
            _button.addEventListener ("click", callBack);//needs to be removed?
            _button.classList.add("cardCloseButton");
            _button.style.zIndex = zIndex;
            document.body.appendChild(_button);//meh
            _button.style.display = "none";
        };

        var animateIn = function(durationMS){
            _xFrom = AppLayout.bounds.width * _hideXNormal;
            _xTo = AppLayout.bounds.width * _showXNormal;
            _button.style.transform = "translate(" + _xFrom + "px, -1px)";
            _animator.start(800, animationUpdate, null, UnitEasing.easeOutBack);
        };

        var animateOut = function(durationMS){
            _xFrom = AppLayout.bounds.width * _showXNormal;
            _xTo = AppLayout.bounds.width * _hideXNormal;
            _button.style.transform = "translate(" + _xFrom + "px, -1px)";
            _animator.start(800, animationUpdate, animateOutComplete, UnitEasing.easeInBack);
        };

        var animationUpdate = function(normal){
            _button.style.transform = "translate(" + MathUtil.interpolate(normal, _xFrom, _xTo) + "px, -1px)";
        };

        var animateOutComplete = function(){
            _button.style.display = "none";
        };
    };
}());