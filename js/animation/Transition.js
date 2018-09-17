/**
 * DEPENDENCIES:
 * utils MathLib, Rectangle
 */

(function() {

    window.TransitionCSSUtil = {};

    TransitionCSSUtil.getTranslateStringFromRect = function(rect){
        return "translate(" + rect.x + "px, " + rect.y + "px)";
    };

    //TODO: same for scaling

}());

(function() {

    window.InterpolationList = function(){

        //public API

        this.addInterpolation = function(target, prop, from, to, easeFunction){
            if(isNaN(from) || isNaN(to) || from == to){
                return;
            }
            _interpolations.push(getInterpolation(_interpolations.length, target, prop, from, to, easeFunction));
        };

        this.interpolate = function(normal){
            var interpol, i;
            for(i=0; i<_interpolations.length; i++){
                interpol = _interpolations[i];
                interpol.target[interpol.prop] = interpol.easing(MathUtil.interpolate(normal, interpol.from, interpol.to));
            }
        };

        this.clear = function(){
            _interpolations.length = 0;
        };

        //private vars and methods

        var _interpolations = [];
        var _createdInterpolations = [];//object pool

        var getInterpolation = function(id, target, prop, from, to, easeFunction){
            if(id >= _createdInterpolations.length){
                _createdInterpolations[id] = new Object();
            }
            var interpolation = _createdInterpolations[id];
            interpolation.target = target;
            interpolation.prop = prop;
            interpolation.from = from;
            interpolation.to = to;
            interpolation.easing = easeFunction || UnitEasing.easeLinear;
            return interpolation;
        }

    };
}());



(function() {

    window.RectangleTransition = function(){

        var _interpolations = new InterpolationList();
        var _xEase, _yEase, _widthEase, _heightEase;

        this.setEasings = function(xEase, yEase, widthEase, heightEase){
            _xEase = xEase;
            _yEase = yEase;
            _widthEase = widthEase;
            _heightEase = heightEase;
        };

        this.init = function(targetRect, fromRect, toRect){
            _interpolations.clear();
            _interpolations.addInterpolation(targetRect, "x",       fromRect.x,         toRect.x,       _xEase);
            _interpolations.addInterpolation(targetRect, "y",       fromRect.y,         toRect.y,       _yEase);
            _interpolations.addInterpolation(targetRect, "width",   fromRect.width,     toRect.width,   _widthEase);
            _interpolations.addInterpolation(targetRect, "height",  fromRect.height,    toRect.height,  _heightEase);
        };

        this.updateToProgressNormal = function(normal){
            _interpolations.interpolate(normal);
        };

    };
}());