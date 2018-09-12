/**
 * Created by Sakri Rosenstrom on 28-08-12
 * With a bunch of edits since then.
 * No Dependencies
 *
 * Contains:
 *
 *      MathLib:
 *      - some frequently used pre-calculated numbers
 *      - interpolation methods
 *      - some color manipulation methods
 *
 *      Rectangle:
 *      - reusable object with some util functions ( update(x,y,w,h) , inflate(value), left(), right(), centerX() etc.
 *
 *      UnitEasing
 *      - common easing functions
 *
 *      UnitAnimator:
 *      - minimal animation feature,
 *      - animates a normal from 0 to 1 in given duration, and easing, uses callbacks, uses requestAnimationFrame

 */


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

//==========================================
//==============::MathUtil::=================
//==========================================

(function (){

    window.MathUtil = {};

    MathUtil.PI2 = Math.PI * 2;
    MathUtil.HALF_PI = Math.PI * .5;
    MathUtil.PI_AND_HALF = Math.PI + Math.PI * .5;

    MathUtil.GOLDEN_RATIO_TOP = .382;
    MathUtil.GOLDEN_RATIO_BOTTOM = .618;

    //return number between 1 and 0
    MathUtil.normalize = function(value, min, max){
        return (value - min) / (max - min);
    };

    //map normalized number to values
    MathUtil.interpolate = function(normal, min, max){
        return min + (max - min) * normal;
    };

    //map a value from one set to another
    MathUtil.map = function(value, min1, max1, min2, max2){
        return MathUtil.interpolate( MathUtil.normalize(value, min1, max1), min2, max2);
    };

    //https://github.com/gre/smoothstep/blob/master/index.js
    MathUtil.smoothstep = function(value, min, max) {
        var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
        return x * x * (3 - 2 * x);
    };

    //TODO: Add comment to describle what these two are
    MathUtil.calculate010Normal = function(normal, bumpNormal){
        if(normal < bumpNormal){
            return normal / bumpNormal;
        }
        return 1 - (normal - bumpNormal) / (1 - bumpNormal);
    };

    MathUtil.calculate101Normal = function(normal, bumpNormal){
        if(normal < bumpNormal){
            return 1 - normal / bumpNormal;
        }
        return (normal - bumpNormal) / (1 - bumpNormal);
    };

    MathUtil.clamp = function(value, min, max){
        return Math.max(min, Math.min(value, max));
    };

    MathUtil.clampRGB = function(value){
        return MathUtil.clamp(0, 255, Math.round(value));
    };

    MathUtil.getRandomNumberInRange = function(min, max){
        return min + Math.random() * (max - min);
    };

    MathUtil.getRGBValue = function(){
        return Math.floor(Math.random() * 255);//this is a bit silly isn't it?
    };

    //from : http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    MathUtil.getRandomHexColorString = function() {
        return MathUtil.rgbToHex( MathUtil.getRGBValue(), MathUtil.getRGBValue(), MathUtil.getRGBValue() );
    };

    MathUtil.getRandomRGBColorString = function(){
        return "rgb(" + MathUtil.getRGBValue() + ", " + MathUtil.getRGBValue() + ", " + MathUtil.getRGBValue() + ")";
    };

    MathUtil.getRandomRGBAColorString = function(alpha){
        return "rgba(" + MathUtil.getRGBValue() + ", " + MathUtil.getRGBValue() + ", " + MathUtil.getRGBValue() + ", " + alpha || Math.random() + ")";
    };

    MathUtil.createRGBAColorString = function(r, g, b, a){
        return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    };

    //from : http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    MathUtil.rgbToHex = function(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    MathUtil.hexToRgb = function(hex, resultObject) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if(!result){
            return null;
        }
        var object = resultObject || {};
        object.r = parseInt(result[1], 16);
        object.g = parseInt(result[2], 16);
        object.b = parseInt(result[3], 16);
        return object;
    };

    /*
        //not tested
    //from : http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    MathUtil.rgbaToHex = function(r, g, b, a) {
        return "#" + ((1 << 32) + (r << 24) + (g << 16) + (b << 8) + a).toString(16).slice(1);
    };

    MathUtil.hexToRgba = function(hex, resultObject) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b, a) {
            return r + r + g + g + b + b + a + a;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if(!result){
            return null;
        }
        var object = resultObject || {};
        object.r = parseInt(result[1], 16);
        object.g = parseInt(result[2], 16);
        object.b = parseInt(result[3], 16);
        object.a = parseInt(result[4], 16);
        return object;
    };
    */

}());





//==========================================
//==============::Rectangle::===============
//==========================================

(function (){

    window.Rectangle = function(x, y, width, height) {

        this.update = function(x, y, width, height){
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        };

        this.inflate = function(value){
            this.update(this.x - value, this.y - value, this.width + value * 2, this.height + value * 2);
        };

        this.updateToRect = function(rect){
            this.update(rect.x, rect.y, rect.width, rect.height);
        };

        this.right = function(){
            return this.x + this.width;
        };

        this.bottom = function(){
            return this.y + this.height;
        };

        this.centerX = function(){
            return this.x + this.width / 2;
        };

        this.centerY = function(){
            return this.y + this.height / 2;
        };

        this.containsPoint = function(x, y){
            return x >= this.x && y >= this.y && x <= this.right() && y <= this.bottom();
        };

        this.isLandscape = function(){
            return this.width > this.height;
        };

        this.smallerSide = function(){
            return Math.min(this.width, this.height);
        }

        this.isPortrait = function(){
            return !this.isLandscape();
        };

        this.clone = function(){
            return new Rectangle(this.x, this.y, this.width, this.height);
        };

        this.toString = function(){
            return "Rectangle{x:"+this.x+" , y:"+this.y+" , width:"+this.width+" , height:"+this.height+"}";
        };

        this.update(isNaN(x) ? 0 : x, isNaN(y) ? 0 : y, isNaN(width) ? 0 : width, isNaN(height) ? 0 : height);

    };


}());



//==============================================
//==============::UNIT EASING::===============
//==============================================

(function (){

    /*
     * From : https://gist.github.com/gre/1650294
     * only considering the t value for the range [0, 1] => [0, 1]
     */
    window.UnitEasing = {
        // no easing, no acceleration
        easeLinear: function (t) { return t },
        // accelerating from zero velocity
        easeInQuad: function (t) { return t*t },
        // decelerating to zero velocity
        easeOutQuad: function (t) { return t*(2-t) },
        // acceleration until halfway, then deceleration
        easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
        // accelerating from zero velocity
        easeInCubic: function (t) { return t*t*t },
        // decelerating to zero velocity
        easeOutCubic: function (t) { return (--t)*t*t+1 },
        // acceleration until halfway, then deceleration
        easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
        // accelerating from zero velocity
        easeInQuart: function (t) { return t*t*t*t },
        // decelerating to zero velocity
        easeOutQuart: function (t) { return 1-(--t)*t*t*t },
        // acceleration until halfway, then deceleration
        easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
        // accelerating from zero velocity
        easeInQuint: function (t) { return t*t*t*t*t },
        // decelerating to zero velocity
        easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
        // acceleration until halfway, then deceleration
        easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },

        // elastic bounce effect at the beginning
        easeInElastic: function (t) { return (.04 - .04 / t) * Math.sin(25 * t) + 1; },
        // elastic bounce effect at the end
        easeOutElastic: function (t) { return .04 * t / (--t) * Math.sin(25 * t) },
        // elastic bounce effect at the beginning and end
        easeInOutElastic: function (t) { return (t -= .5) < 0 ? (.02 + .01 / t) * Math.sin(50 * t) : (.02 - .01 / t) * Math.sin(50 * t) + 1 },

        easeInSine: function (t) { return 1 + Math.sin(Math.PI / 2 * t - Math.PI / 2) },
        easeOutSine : function (t) { return Math.sin(Math.PI / 2 * t) },
        easeInOutSine: function (t) { return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;},

        easeInBack: function(pos) {
            var s = 1.70158;
            return (pos)*pos*((s+1)*pos - s);
        },
        easeOutBack: function(pos) {
            var s = 1.70158;
            return (pos=pos-1)*pos*((s+1)*pos + s) + 1;
        },
        easeInOutBack: function(pos) {
            var s = 1.70158;
            if((pos/=0.5) < 1) return 0.5*(pos*pos*(((s*=(1.525))+1)*pos -s));
            return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos +s) +2);
        }
    };

}());

//==============================================
//==============::UNIT ANIMATOR::===============
//==============================================

/**
 *
 * Dependency on MathUtil
 */
(function (){

    window.UnitAnimator = function() {

        //PRIVATE VARIABLES

        var _duration,
            _animating = true,
            _animationStart,
            _millisecondsAnimated,
            _updateCallBack,
            _completeCallBack,
            _easingFunction;

        //PUBPLIC API

        this.start = function(durationMS, updateCallBack, completeCallBack, easingFunction){
            //console.log("UnitAnimator.start()");
            _duration = durationMS;
            _updateCallBack = updateCallBack;
            _completeCallBack = completeCallBack;//optional
            _easingFunction = easingFunction || UnitEasing.easeLinear;//optional, sets default
            _animating = true;
            _animationStart = Date.now();
            _millisecondsAnimated = 0;//keeps track of how long the animation has been running
            loop();
        };

        this.stop = function(){
            _animating = false;
        };


        //PRIVATE METHODS

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