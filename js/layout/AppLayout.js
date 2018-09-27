/**
 * Created by Sakri Rosenstrom on 24-08-18
 * No Dependencies
 *

 */


(function() {

    //positions are "absolute"
    window.AppLayout = {};//object, no need to instantiate

    AppLayout.bounds = new Rectangle();
    AppLayout.cardBounds = new Rectangle();
    AppLayout.headerBounds = new Rectangle();
    AppLayout.thumbDefaultBounds = new Rectangle();
    AppLayout.storyDefaultBounds = new Rectangle();

    AppLayout.updateLayout = function(width, height){
        if(width==this.bounds.width && height==this.bounds.height){
            return;
        }
        this.bounds.update(0, 0, width, height);
        this.resize(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
        var margin = Math.floor(Math.min(width, height) * .04);
        this.cardBounds.update(margin, margin, width - margin * 2, height - margin * 2);
        this.headerBounds.updateToRect(this.cardBounds);
        this.headerBounds.height = Math.round(Math.min(this.cardBounds.width, this.cardBounds.height) * .1);

        this.thumbDefaultBounds.x = margin * 2;
        this.thumbDefaultBounds.y = this.headerBounds.bottom() + margin;
        //console.log("CardContentLayout updateLayout() img.x, y : ", this.thumbBounds.x, this.thumbBounds.y);
        if(this.bounds.isLandscape()){
            this.thumbDefaultBounds.width = Math.round(this.cardBounds.width * .5 - margin * 2);
            this.thumbDefaultBounds.height = Math.round(this.cardBounds.height * .7);
            this.storyDefaultBounds.updateToRect(this.thumbDefaultBounds);
            this.storyDefaultBounds.x = this.cardBounds.right() - this.storyDefaultBounds.width - margin;
        }else{
            this.thumbDefaultBounds.width = this.cardBounds.width - margin * 2;
            this.thumbDefaultBounds.height = Math.round(this.cardBounds.height * .3);
            this.storyDefaultBounds.updateToRect(this.thumbDefaultBounds);
            this.storyDefaultBounds.y = this.thumbDefaultBounds.bottom() + margin;
            this.storyDefaultBounds.height = this.cardBounds.bottom() - this.storyDefaultBounds.y - margin;
        }
        this.storyDefaultBounds.width -= this.cardBounds.x;
    };

    //All "layout rectangles" must have a unique name.
    //Transitions are unique only to their "layout rectangle"
    AppLayout.rectangles = {
        loaderTitle : {
            default: {
                landscape: {x: .1, y: .15, width: .8, height: .13},
                square: {x: .2, y: .13, width: .6, height: .08},
                portrait: {x: .05, y: .16, width: .9, height: .1}
            },
            transitionFrom: {
                all: {y: -.2}
            },
            transitionTo: {
                all: {x: .75, y: -.2}
            }
        },
        loaderPixelGuy : {
            default: {
                landscape: {x: .35, y: .35, width: .3, height: .3},
                square: {x: .15, y: .42, width: .85, height: .25},
                portrait: {x: .05, y: .4, width: .9, height: .2}
            },
            transitionFrom: {
                all: {y: 1.05}
            },
            laptopTo:{
                all: {x:-.4, y: 0}
            }
        },
        loaderButtrock : {
            default: {
                all: {x: .5, y: .25, width: .3, height: .3}
            },
            transitionTo: {
                landscape: {y: .95, x:1.1, width:"height", height:.1},
                square: {y: .95, x:1.1, width:"height", height:.1},
                portrait: {y: .95, x:1.1, width:.12, height:"width"}
            }
        },
        card : {
            default: {
                all: {x:0, y:0, width:1, height:1}
            },
            rectangles:{
                image : {
                    default: {
                        landscape: {x: .1, y: .1, width: .4, height: .8},
                        square: {x: .1, y: .1, width: .35, height: .8},
                        portrait: {x: .05, y: .1, width: .9, height: .4}
                    }
                },
                text : {
                    default: {
                        landscape: {x: .55, y: .1, width: .4, height: .8},
                        square: {x: .1, y: .1, width: .5, height: .8},
                        portrait: {x: .05, y: .05, width: .9, height: .4}
                    }
                }
            }
        },
        menuButton : {
            default: {
                landscape: {right: "height", y: .8, width: "height", height: .2},
                square: {x: .8, y: .8, width: .2, height: .2},
                portrait: {x: .75, bottom: "width", width: .25, height: "width"}
            },
            transitionFrom: {
                all: {x: 1.1, y:1.1}
            },
            rectangles : {
                progressGraphic : {
                    default: {
                        all: {x: .33, y: .33, width: .65, height: .65}
                    },
                    transitionFrom: {
                        all: {x: 1.1, y:.33}
                    }
                }
            }
        },
        speechBubble : {
            default: {
                all: {x: 0, y: 0, width: 1, height: 1}/* calculated by app, based on menuButton dimensions*/
            },
            transitionFrom: {
                all: {x: 1.1}/* calculated by app, based on menuButton dimensions*/
            },
            transitionTo: {
                all: {x: 1.1}/* calculated by app, based on menuButton dimensions*/
            }
        },
        menuButtonAvatarCenter: {
            default : {
                landscape: {centerX: .5, y: .25, width: "height", height: .5},
                square: {x: .25, y: .25, width: .75, height: .75},
                portrait: {x:.25, centerY: .5, width: .5, height: "width"}
            },
            transitionFrom: {
                all: {x: 0, y: 0, width: 1, height: 1}/* calculated by app, based on avatar dimensions*/
            }
        },
        menuButtonAvatarZoomed: {
            default : {
                all: {x: 0, y: 0, width: 1, height: 1}/* calculated by app, based on avatar dimensions*/
            },
            transitionTo: {
                landscape:  {centerX: "width", centerY: "width", width: 2, height: "width"},
                square:  {centerX: "width", centerY: "width", width: 2, height: "width"},
                portrait:  {centerX: "height", centerY: "height", width: "height", height: 2}
            }
        },
        homeButton : {
            default: {
                all: {x:.1, y:0, width:.2, height:.05}
            },
            transitionFrom: {
                all: {x: -.35}
            }
        },
        closeButton : {
            default: {
                all: {x:.1, y:0, width:.2, height:.05}
            },
            transitionFrom: {
                all: {x: 1.1}
            }
        }
    };

    AppLayout.resize = function(x, y, width, height){
        this.bounds.update(x, y, width, height);
        updateLayoutRectangles();
        //this.debugLayout();
    };

    //api only exposes calculated layout Rectangle bounds
    AppLayout.getLayoutRectStateBounds = function(layoutRectName, stateName){
        var layoutRect = getLayoutRect(layoutRectName);
        return getLayoutRectStateBounds(layoutRect, stateName || "default");
    };

    AppLayout.populateTransitionForLayoutRect = function(transition, layoutRectName, fromState, toState){
        //console.log("AppLayout.populateTransitionForLayoutRect()", layoutRectName, fromState, toState);
        var layoutRect = getLayoutRect(layoutRectName);
        transition.fromRect = getLayoutRectStateBounds(layoutRect, fromState);
        transition.toRect = getLayoutRectStateBounds(layoutRect, toState);
        transition.init();
    };

    //adjustedRect contains calculated values
    AppLayout.adjustStateRect = function(layoutRectName, state, adjustedRect){
        var layoutRect = getLayoutRect(layoutRectName);
        var stateRect = getLayoutRectState(layoutRect, state);
        var parentBounds = layoutRect.parent.default.bounds;
        stateRect.x = adjustedRect.x / parentBounds.width;
        stateRect.y = adjustedRect.y / parentBounds.height;
        stateRect.width = adjustedRect.width / parentBounds.width;
        stateRect.height = adjustedRect.height / parentBounds.height;
        stateRect.bounds.updateToRect(adjustedRect);
        stateRect.bounds.round();
        return stateRect.bounds;
    };

    /*
AppLayout.localToGlobal = function(layoutRectName){
    var jsonRect = getLayoutRect(layoutRectName);
    return localToGlobal(jsonRect, jsonRect.bounds);
};

    AppLayout.debugLayout = function(){
        renderDebugLayoutRects();
    };*/

    //PRIVATE PROPERTIES AND METHODS

    //positions are "local" to container bounds
    var rectNormalCalculator = {
        x : function(rect, bounds, value){
            rect.x = bounds.width * value;
        },
        y : function(rect, bounds, value){
            rect.y = bounds.height * value;
        },
        width : function(rect, bounds, value){
            rect.width = bounds.width * value;
        },
        height : function(rect, bounds, value){
            rect.height = bounds.height * value;
        },
        left : function(rect, bounds, value){
            if(!isNaN(bounds.width)){
                rect.x = bounds.width * value;//can only be calculated if width is known
            }
        },
        right : function(rect, bounds, value){
            if(!isNaN(rect.width)){
                rect.x = bounds.width - bounds.width * value;//can only be calculated if width is known
            }
        },
        top : function(rect, bounds, value){
            if(!isNaN(rect.height)){
                rect.y = bounds.height * value;//can only be calculated if height is known
            }
        },
        bottom : function(rect, bounds, value){
            if(!isNaN(rect.height)){
                rect.y = bounds.height - bounds.height * value;//can only be calculated if height is known
            }
        },
        centerX : function(rect, bounds, value){
            if(!isNaN(rect.width)){
                rect.x = bounds.width * .5 - rect.width * value;//can only be calculated if width is known
            }
        },
        centerY : function(rect, bounds, value){
            if(!isNaN(rect.height)){
                rect.y = bounds.height * .5  - rect.height * value;//can only be calculated if height is known
            }
        }
    };

    //positions are "local" to container bounds
    var positionCalculator = {
        x : function(rect, bounds, value){
            rect.x = value;
        },
        y : function(rect, bounds, value){
            rect.y = value;
        },
        width : function(rect, bounds, value){
            rect.width = value;
        },
        height : function(rect, bounds, value){
            rect.height = value;
        },
        left : function(rect, bounds, value){
            rect.x = value;//same as x()
        },
        right : function(rect, bounds, value){
            rect.x = bounds.width -  value;
        },
        top : function(rect, bounds, value){
            rect.y = value;//same as y()
        },
        bottom : function(rect, bounds, value){
            rect.y = bounds.height - value;
        },
        centerX : function(rect, bounds, value){
            rect.x = bounds.width * .5 - value * .5;
        },
        centerY : function(rect, bounds, value){
            rect.y = bounds.height * .5 - value * .5;
        }
    };


    var _layoutRectanglesLookup = {};
    var _layoutName = "horizontal";//used to select corresponding layout rect

    var getLayoutRect = function(layoutRectName){
        var data = _layoutRectanglesLookup[layoutRectName];
        if(!data){
            console.warn("AppLayout.getLayoutRect() layoutRectName : ", layoutRectName, " is not available. Make sure updateLayout() has been called, or check AppLayout.rectangles");
            return;
        }
        return data;
    };

    var getLayoutRectState = function(layoutRect, stateName){
        var stateRect = layoutRect[stateName];
        if(!stateRect){
            console.warn("AppLayout.getLayoutRectState() state : ", stateName, " is not available in layoutRect : ", layoutRect.name ,". Please check AppLayout.rectangles");
            return;
        }
        return stateRect;
    };

    var getLayoutRectStateBounds = function(layoutRect, state){
        return getLayoutRectState(layoutRect, state).bounds;
    };

    var calculateStateRectangle = function(layoutRect, stateName){
        var state = getLayoutRectState(layoutRect, stateName);
        state.bounds = state.bounds || new Rectangle();
        state.bounds.update();
        var orientationRect = state["all"] || state[_layoutName];
        var numOrientationRectProps = getNumberOfPropertiesInOrientationRect(orientationRect);
        var propName, value, loops = 0;
        //this can be optimized, no need to loop through all values every time
        while(state.bounds.getNumberOfSetItems() < numOrientationRectProps){
            for(propName in rectNormalCalculator){
                value = orientationRect[propName];
                //console.log("update : ", propName, value, rect.toString());
                if(!isNaN(value)){
                    rectNormalCalculator[propName](state.bounds, layoutRect.parent.default.bounds, Number(value));//calls x(), y(), w, h, left() etc.
                }else if(!isNaN(state.bounds[value])){
                    if(isRectangleProperty(propName)){
                        state.bounds[propName] = state.bounds[value];//propName == "x", "y", "width" or "height"
                    }else{
                        positionCalculator[propName](state.bounds, layoutRect.parent.default.bounds, state.bounds[value]);//propName == "left", "right", "top", "bottom", "centerX", "centerY"
                    }
                }
            }
            if(++loops > 3){
                console.warn("AppLayout.setJsonRectBoundsToState() cannot calculate bounds for : ", layoutRect.name, stateName,  orientationRect);
                break;
            }
        }
        if(state.bounds.isSet()){
            return state.bounds;
        }
        if(stateName === "default"){
            console.warn("AppLayout.setJsonRectBoundsToState() incomplete default state calculation : ", layoutRect.name, " : " ,  orientationRect, ", result: ",  rect.toString());
            return;
        }
        state.bounds.replaceNullValuesFrom(layoutRect.default.bounds);
        return state.bounds;
    };

    var updateLayoutRectangles = function(){
        updateLayoutName();
        _layoutRectanglesLookup = {};//not really necessary
        AppLayout.default = {bounds : AppLayout.bounds};//little hack to enable traversal
        traverseLayoutRectangles(AppLayout);//bit awkward to pass "self" as a global variable to private method?
    };

    //traverses recursively through all "layout rectangles", creates/updates bounds to "default"
    var traverseLayoutRectangles = function(layoutRect){
        var childLayoutRect, childName, stateName, calculatedBounds;
        for(childName in layoutRect.rectangles){
            childLayoutRect = layoutRect.rectangles[childName];
            childLayoutRect.name = childName;//only used for debugging
            childLayoutRect.parent = layoutRect;
            _layoutRectanglesLookup[childName] = childLayoutRect;
            for(stateName in childLayoutRect){
                if(stateName !== "rectangles" && stateName !== "name" && stateName !== "parent"){
                    calculatedBounds = calculateStateRectangle(childLayoutRect, stateName);
                    calculatedBounds.round();
                    //console.log("=====> Layout Traverse :\t", childName, ":" , stateName, "\t" , calculatedBounds.toString());
                }
             }
             if(childLayoutRect.rectangles){
                 traverseLayoutRectangles(childLayoutRect);
             }
        }
    };

    var updateLayoutName = function(){
        if(AppLayout.bounds.isSquareish(.2)){
            _layoutName = "square";
        }else{
            _layoutName = AppLayout.bounds.isLandscape() ? "landscape" : "portrait";
        }
    };

    var getNumberOfPropertiesInOrientationRect = function(rect){
        if(isNaN(rect.orientationRectPropertyCount)){
            rect.orientationRectPropertyCount = 0;
            for(var prop in rect){
                rect.orientationRectPropertyCount += (positionCalculator[prop] ? 1: 0);
            }
        }
        return rect.orientationRectPropertyCount;
    };

    var isRectangleProperty = function(propName){
        return propName === "x" || propName === "y" || propName === "width" || propName === "height";
    };

    //---------------:: DEBUGGING

    /*
    var _debugCanvas;
    function getDebugCanvas(){
        _debugCanvas = _debugCanvas || document.createElement("canvas");
        _debugCanvas.width = AppLayout.bounds.width;
        _debugCanvas.height = AppLayout.bounds.height;
        _debugCanvas.style.position = "absolute";
        _debugCanvas.style.zIndex = appConfig.debugLayer;
        document.body.appendChild(_debugCanvas);
        return _debugCanvas;
    };


    var renderDebugLayoutRects = function(layoutRect, color){
        var canvas = getDebugCanvas();
        var context = canvas.getContext("2d");//could be optimized, but this is a debug feature
        var childLayoutRect, childName, rect;
        for(childName in layoutRect.rectangles){
            childLayoutRect = layoutRect.rectangles[childName];
            context.fillStyle = color || MathUtil.getRandomRGBAColorString(.4);
            rect =
            context.fillRect( + childLayoutRect.bounds.x, jsonRect.bounds.y + childLayoutRect.bounds.y, childLayoutRect.bounds.width, childLayoutRect.bounds.height);
            //console.log("renderDebugLayoutRects()", childName, childLayoutRect.bounds.toString());
            if(childLayoutRect.rectangles){
                renderDebugLayoutRects(childLayoutRect, color);//recurse
            }
        }
    };
    */


}());