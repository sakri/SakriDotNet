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