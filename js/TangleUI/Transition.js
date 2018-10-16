/**
 * DEPENDENCIES:
 * utils MathLib, Rectangle
 *  * Contains:
 *
 *      TransitionCSSUtil:
 *      - incomplete
 *
 *      InterpolationList:
 *      - greensock like list of "start/end" properties (x,y,w,h only) that can be interpolated, update mechanism for list
 *
 *      RectangleTransition:
 *      - object with current Rectangle, fromRectangle and toRectangle properties, with update to normal mechanism
 *      - generates InterpolationList for set Rectangle properties
 *
 *      RectangleTransitionAnimator:
 *      - uses UnitAnimator to animate a RectangleTransition
 *
 *      ChainedRectangleTransitionAnimator:
 *      - support for palying a list or a sequence of RectangleTransitionAnimator animations
 *
 *      TransitionStore:
 *      - Contains data descriptions of RectangleTransitions which link to LayoutRectangle ids and corresponding
 *      transitions found in TangleUI
 *      - factory methods for creating instances of RectangleTransition and RectangleTransitionAnimator
 *      - some getters/setters/update mechanisms
 *
 */

//=============================================================
//==============::Transition CSS Util::=================
//=============================================================

(function() {

    window.TransitionCSSUtil = {};

    TransitionCSSUtil.setTranslate = function(target, x, y){
        target.style.transform = this.getTranslateString(x, y);
    };

    TransitionCSSUtil.getTranslateString = function(x, y){
        //console.log("TransitionCSSUtil.getTranslateString()", x, y);
        return "translate(" + x + "px, " + y + "px)";
    };

    TransitionCSSUtil.setTransitionTranslate = function(target, fromRect, toRect){
        //TODO: tighter integration, better solution required, with width, height, alpha, rotation? z?
        var x = fromRect.x === toRect.x ? "0" : (fromRect.x - toRect.x);
        var y = fromRect.y === toRect.y ? "0" : (fromRect.y - toRect.y);
        target.style.transform = this.getTranslateString(x, y);
    };

    TransitionCSSUtil.setTranslateFromRect = function(target, rect){
        target.style.transform = this.getTranslateStringFromRect(rect);
    };

    TransitionCSSUtil.getTranslateStringFromRect = function(rect){
        return "translate(" + rect.x + "px, " + rect.y + "px)";
    };

    //TODO: move, is useful without Transitions.
    TransitionCSSUtil.showElement = function(element, bounds){
        if(!bounds){
            element.style.display = "none";//used to toggle visibility. TangleUI managed items use display:block, so no issue
            return;
        }
        element.style.display = "block";
        element.style.left = Math.round(bounds.x) + "px";
        element.style.top = Math.round(bounds.y) + "px";
        element.style.width = Math.round(bounds.width) + "px";
        element.style.height = Math.round(bounds.height) + "px";
    };

}());

//=============================================================
//==============::Interpolation List::=================
//=============================================================

//TODO: consider storing all interploations in one array, reference by index or id
(function() {

    var _totalCreatedInterpolations = 0;

    window.InterpolationList = function(){

        //public API

        this.addInterpolation = function(target, prop, from, to, easeFunction){
            if(isNaN(from) || isNaN(to)){
                return;
            }
            if(from === to){
                target[prop] = to;
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
        };

        this.clear = function(){
            _interpolations.length = 0;
        };

        //private vars and methods

        var _interpolations = [];
        var _createdInterpolations = [];//object pool

        var getInterpolation = function(id, target, prop, from, to, easeFunction){
            if(id >= _createdInterpolations.length){
                _createdInterpolations[id] = {};
            }
            _totalCreatedInterpolations++;
            var interpolation = _createdInterpolations[id];
            interpolation.target = target;
            interpolation.prop = prop;
            interpolation.from = from;
            interpolation.to = to;
            interpolation.easing = easeFunction || UnitEasing.easeLinear;
            return interpolation;
        };

    };

    //InterpolationList

}());

//=============================================================
//==============::Rectangle Transition::=================
//=============================================================


(function() {

    window.RectangleTransition = function(){

        this.data = undefined;//TODO: rethink this
        this.fromRect = new Rectangle();
        this.toRect = new Rectangle();
        this.rectangle = new Rectangle();

        var _interpolations = new InterpolationList();

        this.updateTargets = function(fromRect, toRect){
            this.fromRect.updateToRect(fromRect);
            this.toRect.updateToRect(toRect);
        };

        this.init = function(data){
            this.data = data || {duration:500};
            _interpolations.clear();
            _interpolations.addInterpolation(this.rectangle, "x",       this.fromRect.x,         this.toRect.x,       this.data["xEase"]);
            _interpolations.addInterpolation(this.rectangle, "y",       this.fromRect.y,         this.toRect.y,       this.data["yEase"]);
            _interpolations.addInterpolation(this.rectangle, "width",   this.fromRect.width,     this.toRect.width,   this.data["widthEase"]);
            _interpolations.addInterpolation(this.rectangle, "height",  this.fromRect.height,    this.toRect.height,  this.data["heightEase"]);
        };

        this.updateToNormal = function(normal){
            _interpolations.interpolate(normal);
            //console.log("RectTrans.updateToNormal()", this.rectangle.toString())
        };
        /*
        this.logInterpolations = function(){
            console.log(_interpolations.toString());
        }*/

    };
}());

//=============================================================
//==============::Transition Store::===========================
//=============================================================

(function() {

    window.TransitionStore = {};

    //Public API

    TransitionStore.setTransitionDefinitions = function(definitionsJson){
        _transitionDefinitions = definitionsJson;
    };

    //creates or updates returned transition
    TransitionStore.getTangleUITransition = function(transitionId){
        var definitionRect = _transitionDefinitions[transitionId];
        return this.getTransition(
            transitionId,
            TangleUI.getRect(definitionRect.layoutRectId, definitionRect.from),
            TangleUI.getRect(definitionRect.layoutRectId, definitionRect.to),
            definitionRect
        );
    };

    //returns either a new Transition, or an updated cached instance.
    TransitionStore.getTransition = function(transitionId , fromRect, toRect, data){
        var transition = _createdTransitions[transitionId] || new RectangleTransition();
        updateTransition(transition, fromRect, toRect, data);
        _createdTransitions[transitionId] = transition;
        return transition;
    };

    //private properties and methods

    var _transitionDefinitions = [],
        _createdTransitions = {},
        _stateRect;

    var getTransitionDataForId = function(transitionId){
        var data = _transitionDefinitions[transitionId];
        if(!data){
            console.warn("TransitionStore.getTransitionDataForId Warning : transition with id : ", transitionId ," unavailable. Please check transitions json");
        }
        return data;
    };

    var updateTransition = function(transition, fromRect, toRect, data){
        var updated = false;
        if(!transition.fromRect.equals(fromRect)){
            transition.fromRect.updateToRect(fromRect);
            updated = true;
        }
        if(!transition.toRect.equals(toRect)){
            transition.toRect.updateToRect(toRect);
            updated = true;
        }
        if(updated){
            transition.init(data);//{data{} must contain : duration, optional : xEase, yEase, widthEase, heightEase}
            return true;
        }
        return false;
    };


}());