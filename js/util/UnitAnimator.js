//=============================================================
//==============::Request Animation Polyfill::=================
//=============================================================

//https://gist.github.com/paulirish/1579671

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

//==============================================
//==============::UNIT ANIMATOR::===============
//==============================================

/*
*      - minimal animation feature,
*      - animates a normal from 0 to 1 in given duration (optional easing)
 *     - uses callbacks
 *     - uses requestAnimationFrame
*/

(function (){

    window.UnitAnimator = function() {

        //private variables

        var _duration,
            _animating = true,
            _animationStart,
            _millisecondsAnimated,
            _updateCallBack,
            _completeCallBack,
            _easingFunction;

        //Public API

        this.start = function(durationMS, updateCallBack, completeCallBack, easingFunction){
            //console.log("UnitAnimator.start()");
            _duration = durationMS;
            _updateCallBack = updateCallBack;
            _completeCallBack = completeCallBack;
            _easingFunction = easingFunction || UnitEasing.easeLinear;//optional, sets default
            _animating = true;
            _animationStart = Date.now();
            _millisecondsAnimated = 0;//keeps track of how long the animation has been running
            loop();
        };

        this.stop = function(){
            _animating = false;
        };

        this.isAnimating = function(){
            return _animating === true;// (return _animating) can't possibly return a reference?
        };

        //private methods

        var dispatchUpdate = function(){
            _updateCallBack( _easingFunction(MathUtil.normalize(_millisecondsAnimated, 0, _duration)) );
        };

        var dispatchComplete = function(){
            dispatchUpdate();
            if(_completeCallBack){
                _completeCallBack();
            }
        };

        var loop = function(){
            if(!_animating){
                return;
            }
            _millisecondsAnimated = Date.now() - _animationStart;
            if(_millisecondsAnimated >= _duration){
                //console.log("Sakri.UnitAnimator.update() animation complete");
                _animating = false;
                _millisecondsAnimated = _duration;
                dispatchComplete();
                return;
            }
            dispatchUpdate();
            requestAnimationFrame(loop);
        };

    };

}());