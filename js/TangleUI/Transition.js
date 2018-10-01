/**
 * DEPENDENCIES:
 * utils MathLib, Rectangle
 *  * Contains:
 *
 *      TransitionCSSUtil:
 *      - incomplete
 *
 *      InterpolationList:
 *      - greensock like list of "start/end" properties that can be inerpolated, update mechanism for list
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

    TransitionCSSUtil.showElement = function(element, value, bounds){
        if(!value){
            element.style.visibility = "hidden";
            return;
        }
        element.style.visibility = "visible";
        element.style.left = Math.round(bounds.x) + "px";
        element.style.top = Math.round(bounds.y) + "px";
        element.style.width = Math.round(bounds.width) + "px";
        element.style.height = Math.round(bounds.height) + "px";
    };

}());

//=============================================================
//==============::Interpolation List::=================
//=============================================================

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

        this.fromRect = new Rectangle();
        this.toRect = new Rectangle();
        this.rectangle = new Rectangle();

        var _interpolations = new InterpolationList();
        var _xEase, _yEase, _widthEase, _heightEase;

        this.updateTargets = function(fromRect, toRect){
            this.fromRect.updateToRect(fromRect);
            this.toRect.updateToRect(toRect);
        };

        this.setEasings = function(xEase, yEase, widthEase, heightEase){
            _xEase = xEase;
            _yEase = yEase;
            _widthEase = widthEase;
            _heightEase = heightEase;
        };

        this.init = function(){
            _interpolations.clear();
            _interpolations.addInterpolation(this.rectangle, "x",       this.fromRect.x,         this.toRect.x,       _xEase);
            _interpolations.addInterpolation(this.rectangle, "y",       this.fromRect.y,         this.toRect.y,       _yEase);
            _interpolations.addInterpolation(this.rectangle, "width",   this.fromRect.width,     this.toRect.width,   _widthEase);
            _interpolations.addInterpolation(this.rectangle, "height",  this.fromRect.height,    this.toRect.height,  _heightEase);
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
//==============::Rectangle Transition Animator::==============
//=============================================================

(function() {

    var blankCallback = function(){};

    //Runs a transition, does not manipulate transition
    window.RectangleTransitionAnimator = function(){

        var _transition,
            _animator = new UnitAnimator(),
            _duration = 1000,
            _easingFunction = undefined,
            _updateCallback = blankCallback,
            _completeCallback = blankCallback;

        this.setTransition = function(transition, duration, easingFunction){
            _transition = transition;
            _duration = duration;
            _easingFunction = easingFunction;
        };

        this.setCallbacks = function(updateCallback, completeCallback){
            this.setUpdateCallback (updateCallback);
            this.setCompleteCallback(completeCallback);
        };

        this.setUpdateCallback = function(updateCallback){
            _updateCallback = updateCallback || blankCallback;
        };

        this.setCompleteCallback = function(completeCallback){
            _completeCallback = completeCallback || blankCallback;
        };

        this.getTransition = function(){
            return _transition;
        };

        this.getRectangle = function(){
            return _transition.rectangle;
        };

        this.isAnimating = function(){
            return _animator && _animator.isAnimating();
        };

        this.play = function(){
            //update(0);
            _animator.start(_duration, update, _completeCallback, _easingFunction);
        };

        this.playReverse = function(){
            //update(1);
            _animator.start(_duration, updateReverse, _completeCallback, _easingFunction);
        };

        this.stop = function(){
            _animator.stop();
        };

        //private properties and methods

        var update = function (normal) {
            _transition.updateToNormal(normal);
            _updateCallback(normal, _transition.rectangle);
        };

        var updateReverse = function (normal) {
            _transition.updateToNormal(1- normal);
            _updateCallback(normal, _transition.rectangle);
        };

    };

}());

//=============================================================
//==========::Chained Rectangle Transition Animator::==========
//=============================================================

(function() {

    var blankCallback = function(){};

    window.ChainedRectangleTransitionAnimator = function(){

        var _animations, _currentAnimation, _animationIndex, _completeCallback;

        this.isAnimating = function(){
            return _currentAnimation && _currentAnimation.isAnimating();
        };

        //TODO: expects a list of {transitionId:String, updateCallback:Function, completeCallback:Function}
        this.setTransitions = function(animations){
            _animations = animations;
        };

        //TODO: REMOVE, temporary hack to get TransitionStore resizing to work for ChainAnimtions
        this.getAnimations = function(){
            return _animations;
        };

        this.getRectangle = function(){
            return _currentAnimation.getRectangle();
        };

        //_animations can have an updateCallback, but completeCallback will be overridden... this is unfortunate
        this.play = function(completeCallback){
            _completeCallback = completeCallback || blankCallback;
            _animationIndex = -1;
            playNextAnimation();
        };

        var playNextAnimation = function(){
            var animObject = _animations[++_animationIndex];
            _currentAnimation = TransitionStore.getAnimationByTransitionId(animObject.transitionId, animObject.updateCallback);
            //console.log("ChainedRectangleTransitionAnimator.playNextAnimation()", _animationIndex);
            _currentAnimation.setCompleteCallback(_animationIndex === _animations.length - 1 ? _completeCallback : playNextAnimation);
            _currentAnimation.play();
        };

        //this.playReverse = function(updateCallback, completeCallback){};

        this.stop = function(){
            if(_currentAnimation){
                _currentAnimation.stop();
            }
        };

    };

}());


//=============================================================
//==============::Transition STORE::===========================
//=============================================================

(function() {

    //private static properties and methods

    var _transitions = [];

    var getTransitionDataForId = function(transitionId){
        var data = _transitions[transitionId];
        if(!data){
            console.warn("RectangleTransitionAnimator constructor Warning : transition with id : ", transitionId ," unavailable. Please check transitions json");
        }
        return data;
    };

    var populateTransitionForLayoutRect = function(transition, layoutRectName, fromState, toState){
        //console.log("TransitionStore.populateTransitionForLayoutRect()", layoutRectName, fromState, toState);
        transition.fromRect = TangleUI.getRect(layoutRectName, fromState);
        transition.toRect = TangleUI.getRect(layoutRectName, toState);
        transition.init();
    };


    window.TransitionStore = {};

    //Public API

    var _createdTransitions = {};
    var _createdAnimations = {};

    TransitionStore.setTransitionDefinitions = function(definitionsJson){
        _transitions = definitionsJson;
    };

    //Rename to reflect this is created from TangleUI Rects
    TransitionStore.getTransition = function(transitionId){
        var transition = _createdTransitions[transitionId] || new RectangleTransition();
        var data = getTransitionDataForId(transitionId);
        //console.log("TransitionStore.getTransition()", transitionId, data);
        transition.data = data;
        transition.setEasings(data["xEase"], data["yEase"], data["widthEase"], data["heightEase"]);
        populateTransitionForLayoutRect(transition, data.layoutRectId, data.from, data.to);
        transition.updateToNormal(0);
        _createdTransitions[transitionId] = transition;
        return transition;
    };

    TransitionStore.resizeTransition = function(transition){
        populateTransitionForLayoutRect(transition, transition.data.layoutRectId, transition.data.from, transition.data.to);
    };

    TransitionStore.resizeChainTransition = function(chain){
        var transitions = chain.getAnimations();
        for(var i=0; i<transitions.length; i++){
            TransitionStore.resizeTransitionAnimation(transitions[i]);
        }
    };

    TransitionStore.getAnimationByTransitionId = function(transitionId, updateCallback, completeCallback){
        var transition  = this.getTransition(transitionId);
        var animation = _createdAnimations[transitionId] || new RectangleTransitionAnimator();
        animation.setTransition(transition, transition.data.duration, transition.data.easing);
        if(updateCallback){
            animation.setUpdateCallback(updateCallback);
        }
        if(completeCallback){
            animation.setCompleteCallback(completeCallback);
        }
        _createdAnimations[transitionId] = animation;
        return animation;
    };

    TransitionStore.resizeTransitionAnimation = function(animation){
        this.resizeTransition(animation.getTransition());
    };

}());