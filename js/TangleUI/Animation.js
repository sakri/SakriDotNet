/**
 * DEPENDENCIES:
 * utils MathLib, Rectangle, TangleUI, Transition
 *  * Contains:
 *
 *      RectangleTransitionAnimator:
 *      - uses UnitAnimator to animate a RectangleTransition
 *
 *      ChainedRectangleTransitionAnimator:
 *      - support for palying a list or a sequence of RectangleTransitionAnimator animations
 *
 *      AnimationStore:
 *      - creates and stores animations and chainedAnimations
 *      - can stop all running animations.
 *
 */

//=============================================================
//==============::Rectangle Transition Animator::==============
//=============================================================

(function() {

    var blankCallback = function(){};

    //Runs a transition, does not manipulate transition
    window.RectangleTransitionAnimator = function(){

        var _transition,
            _animator = new UnitAnimator(),
            _updateCallback = blankCallback,
            _completeCallback = blankCallback;

        this.setTransition = function(transition){
            _transition = transition;
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

        this.getUpdateCallback = function(){
            return _updateCallback;
        };

        this.getCompleteCallback = function(){
            return _completeCallback;
        };

        //TODO: these should be removed
        this.getRectangle = function(){
            return _transition.rectangle;
        };
        this.getFromRectangle = function(){
            return _transition.fromRect;
        };
        this.getToRectangle = function(){
            return _transition.toRect;
        };

        this.isAnimating = function(){
            return _animator && _animator.isAnimating();
        };

        this.play = function(){
            //update(0);
            _animator.start(_transition.data["duration"], update, _completeCallback, _transition.data["easing"]);
        };

        this.playReverse = function(){
            //update(1);
            _animator.start(_transition.data["duration"], updateReverse, _completeCallback, _transition.data["easing"]);
        };

        this.stop = function(){
            _animator.stop();
        };

        this.logDebug = function(){
            console.log("LOG DEBUG TRANSITION");
            console.log("from : ", _transition.fromRect.toString());
            console.log("to : ", _transition.toRect.toString());
            console.log("current : ", _transition.rectangle.toString());
        }

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

        var _animations, _currentAnimation, _animationIndex,
            _updateCallback, _completeCallback, _currentUpdateCallback, _currentCompleteCallback;

        this.isAnimating = function(){
            return _currentAnimation && _currentAnimation.isAnimating();
        };

        this.setAnimations = function(animations, updateCallback, completeCallback){
            _updateCallback = updateCallback || blankCallback;
            _completeCallback = completeCallback || blankCallback;
            _animations = animations.slice();//copy
        };

        //TODO: this should be removed
        this.getRectangle = function(){
            return _currentAnimation.getRectangle();
        };

        this.play = function(){
            if(!_animations || !_animations.length){
                console.log("ChainedRectangleTransitionAnimator.play, skipping, no animations");
                //_completeCallback();//maybe? width delay?
                return;
            };
            _currentAnimation = undefined;
            playNextAnimation();
        };

        var playNextAnimation = function(){
            if(_currentAnimation){
                _currentCompleteCallback();
                resetCurrentCallbacks();
            }
            _currentAnimation = _animations.shift();
            _currentUpdateCallback = _currentAnimation.getUpdateCallback();
            _currentCompleteCallback = _currentAnimation.getCompleteCallback();
            //console.log("ChainedRectangleTransitionAnimator.playNextAnimation()", _animationIndex);
            _currentAnimation.setUpdateCallback(chainAnimationUpdateHandler)
            _currentAnimation.setCompleteCallback(_animations.length ? playNextAnimation : chainAnimationCompleteHandler);
            _currentAnimation.play();
        };

        var chainAnimationUpdateHandler = function(normal, rect){
            _currentUpdateCallback(normal, rect);
            _updateCallback(normal, rect);
        };

        var chainAnimationCompleteHandler = function(){
            _currentCompleteCallback();
            resetCurrentCallbacks();
            _currentUpdateCallback = blankCallback;
            _currentCompleteCallback = blankCallback;
            _currentAnimation = null;
            _completeCallback();
        };

        var resetCurrentCallbacks = function(){
            _currentAnimation.setUpdateCallback(_currentUpdateCallback)
            _currentAnimation.setCompleteCallback(_currentCompleteCallback);
        };

        //this.playReverse = function(updateCallback, completeCallback){};

        this.stop = function(){
            if(_currentAnimation){
                _currentAnimation.stop();
                resetCurrentCallbacks();
            }
        };

    };

}());


//=============================================================
//==============::Animation Store::===========================
//=============================================================

(function() {

    window.AnimationStore = {};

    //Public API

    AnimationStore.getAnimation = function(animationId, transition, updateCallback, completeCallback){
        var animation = _createdAnimations[animationId] || new RectangleTransitionAnimator();
        animation.setTransition(transition);
        if(updateCallback){
            animation.setUpdateCallback(updateCallback);
        }
        if(completeCallback){
            animation.setCompleteCallback(completeCallback);
        }
        _createdAnimations[animationId] = animation;
        return animation;
    };

    AnimationStore.getTangleUIAnimation = function(animationId, transitionId, updateCallback, completeCallback){
        var transition = TransitionStore.getTangleUITransition(transitionId);
        var animation = this.getAnimation(animationId, transition, updateCallback, completeCallback);
        return animation;
    };

    AnimationStore.getChainedAnimation = function(chainedAnimationId, animations, updateCallback, completeCallback){
        var animation = _createdChainAnimations[chainedAnimationId] || new ChainedRectangleTransitionAnimator();
        animation.setAnimations(animations, updateCallback, completeCallback);
        _createdChainAnimations[chainedAnimationId] = animation;
        return animation;
    };

    AnimationStore.stopAllAnimations = function(){
        for(var animation in _createdAnimations){
            animation.stop();
        }
        for(var animation in _createdChainAnimations){
            animation.stop();
        }
    };

    //private properties and methods

    var _createdAnimations = {};
    var _createdChainAnimations = {};

}());

(function() {

    //private class
    var DomElementTransitionAnimation = function(){

        //Public API
        this.playTangleUIAnimation = function(animationId, transitionId, target, completeCallback){
            _target = target;
            var anim = AnimationStore.getTangleUIAnimation(animationId, transitionId);
            this.playAnimation(anim, target, completeCallback);
        };

        this.playAnimation = function(animation, target, completeCallback){
            _anim = animation;
            _anim.setCallbacks(updateTransitionAnimation, completeCallback);
            _target = target;
            _toRect = _anim.getToRectangle();
            _anim.play();
        };

        this.stop = function(){
            _anim.stop();
        };
        //DomElement.getChainedAnimation  todo: consider if useful?

        //private properties and methods

        var _anim, _target, _toRect;

        var updateTransitionAnimation = function(normal, rect){
            TransitionCSSUtil.setTransitionTranslate(_target, rect, _toRect);
        };

    };

    //WORKS ONLY WITH TangleUI registered transitions! TODO: FIX
    window.DomElementTransitionAnimationStore = {};
    DomElementTransitionAnimationStore.playTangleUIAnimation = function(animationId, transitionId, target, completeCallback){
        _createdAnimations[animationId] = _createdAnimations[animationId] || new DomElementTransitionAnimation();
        _createdAnimations[animationId].playTangleUIAnimation(animationId, transitionId, target, completeCallback);
    };
    DomElementTransitionAnimationStore.playAnimation = function(animationId, animation, target, completeCallback){
        _createdAnimations[animationId] = _createdAnimations[animationId] || new DomElementTransitionAnimation();
        _createdAnimations[animationId].playAnimation(animation, target, completeCallback);
    };
    DomElementTransitionAnimationStore.stop = function(){
        for(var animation in _createdAnimations){
            animation.stop();
        }
    }

    //private properties and methods

    var _createdAnimations = {};

}());