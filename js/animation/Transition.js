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
                interpol.target[interpol.prop] = MathUtil.interpolate(interpol.easing(normal), interpol.from, interpol.to);
            }
        };

        this.toString = function(){
            var stri = "InterpolationList{";
            var interpol, i;
            for(i=0; i<_interpolations.length; i++){
                interpol = _interpolations[i];
                stri += ("\n\tinterpol : prop : " + interpol.prop + ", from : " + interpol.from + ", to : " + interpol.to + ", target:" + interpol.target);
            }
            return stri + "\n}\n";
        }

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
        };

    };
}());



(function() {

    window.RectangleTransition = function(){

        this.fromRect = new Rectangle();
        this.toRect = new Rectangle();

        var _interpolations = new InterpolationList();
        var _xEase, _yEase, _widthEase, _heightEase;

        this.setEasings = function(xEase, yEase, widthEase, heightEase){
            _xEase = xEase;
            _yEase = yEase;
            _widthEase = widthEase;
            _heightEase = heightEase;
        };

        this.init = function(targetRect){
            _interpolations.clear();
            _interpolations.addInterpolation(targetRect, "x",       this.fromRect.x,         this.toRect.x,       _xEase);
            _interpolations.addInterpolation(targetRect, "y",       this.fromRect.y,         this.toRect.y,       _yEase);
            _interpolations.addInterpolation(targetRect, "width",   this.fromRect.width,     this.toRect.width,   _widthEase);
            _interpolations.addInterpolation(targetRect, "height",  this.fromRect.height,    this.toRect.height,  _heightEase);
        };

        this.updateToProgressNormal = function(normal){
            _interpolations.interpolate(normal);
        };

        this.logInterpolations = function(){
            console.log(_interpolations.toString());
        }

    };
}());