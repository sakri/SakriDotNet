/**
 * Created by Sakri Rosenstrom on 24-08-18
 * No Dependencies
 *
 * - All app layout calculations
 *      -> From an architectural viewpoint it's heretical:
 *          * Layout should not be an external dependency
 *          * Multiple classes accessing the same layout is risky when making changes
 *      -> From a practical standpoint it's very convenient
 *
 *
 * Contains:
 *
 *      AppLayout:
 *      -
 *
 *      CardMenuLayout:
 *      -
 *
 *      CardContentLayout
 *      -
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
            transitionTo: {
                all: {y: .9, x:1.05}
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
                        all: {x: 1.1}
                    }
                },
                speechBubble : {
                    default: {
                        all: {x: 1.1, y: -.25, width: 4.8, height: .5}
                    },
                    transitionFrom: {
                        all: {x: 1.1}
                    }
                }
            },
        },
        transitionMenuButtonToCenter: {
            default : {
                landscape: {centerX: .5, y: .25, width: "height", height: .5},
                square: {x: .25, y: .25, width: .75, height: .75},
                portrait: {x:.25, centerY: .5, width: .5, height: "width"}
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

    //TODO: from legacy code, try to get rid of it
    var _propNames = ["x", "y", "width", "height", "left", "right", "top", "bottom", "centerX", "centerY"];

    function getJsonRect(name){
        var jsonRect = _jsonRectangles[name];
        if(!jsonRect){
            console.warn("AppLayout.getJsonRect() name : ", name, " is not available. Please check AppLayout.rectangles");
            return;
        }
        return jsonRect;
    };

    AppLayout.getJsonRectBounds = function(name){
        return getJsonRect(name).bounds;
    };

    //TODO: rename to "populateTransition" or so
    AppLayout.initTransition = function(transition, layoutRectName, fromState, toState){
        var jsonRect = getJsonRect(layoutRectName);
        updateRectToState(transition.fromRect, jsonRect, fromState);
        updateRectToState(transition.toRect, jsonRect, toState);
        transition.init(jsonRect.bounds);
    };

    AppLayout.localToGlobal = function(layoutRectName){
        var jsonRect = getJsonRect(layoutRectName);
        return localToGlobal(jsonRect, jsonRect.bounds);
    };

    function localToGlobal(jsonRect, rect){
        if(jsonRect.parent){
            console.log("whee lToG : ", jsonRect.parent.bounds.toString());
            rect.x += jsonRect.parent.bounds.x;
            rect.y += jsonRect.parent.bounds.y;
            localToGlobal(jsonRect.parent, rect);
        }
        return rect;
    };

    AppLayout.updateLayoutRectBoundsToState = function(layoutRectName, state){
        var jsonRect = getJsonRect(layoutRectName);
        updateRectToState(jsonRect.bounds, jsonRect, state);
        return jsonRect.bounds;
    };

    AppLayout.updateRectToLayoutRectState = function(updateRect, layoutRectName, state){
        var jsonRect = getJsonRect(layoutRectName);
        updateRectToState(updateRect, jsonRect, state);
    };

    var getNumberOfPropertiesInOrientationRect = function(rect){
        if(isNaN(rect.orientationRectPropertyCount)){
            rect.orientationRectPropertyCount = 0;
            for(var prop in rect){
                rect.orientationRectPropertyCount += _propNames.indexOf(prop) > -1 ? 1: 0;
            }
        }
        return rect.orientationRectPropertyCount;
    };

    var updateRectToState = function(rect, jsonRect, state){
        if(!jsonRect){
            console.warn("AppLayout.updateRectToState() warning : provided jsonRect is not valid : ", jsonRect);
            return;
        }
        state = state || "default"
        var sourceRect = jsonRect[state];
        if(!sourceRect){
            console.warn("AppLayout.updateLayoutRectToState() state : ", state, " is not available. Please check AppLayout.rectangles");
            console.log(jsonRect);
            return;
        }
        var orientationRect = sourceRect["all"] || sourceRect[_layoutName];
        var numOrientationRectProps = getNumberOfPropertiesInOrientationRect(orientationRect);
        rect.update();//reset
        var propName, value, loops = 0;
        while(rect.getNumberOfSetItems() < numOrientationRectProps){
            for(propName in rectNormalCalculator){
                value = orientationRect[propName];
                //console.log(propName, value, rect.toString());
                if(!isNaN(value)){
                    rectNormalCalculator[propName](rect, jsonRect.parent.bounds, Number(value));//calls x(), y(), w, h, left() etc.
                }else if(!isNaN(rect[value])){
                    if(_propNames.indexOf(propName) < 4){
                        rect[propName] = rect[value];//propName == "x", "y", "width" or "height"
                    }else{
                        positionCalculator[propName](rect, jsonRect.parent.bounds, rect[value]);//propName == "left", "right", "top", "bottom", "centerX", "centerY"
                    }
                }
            }
            if(++loops > 3){
                console.warn("AppLayout.setJsonRectBoundsToState() cannot calculate bounds for : ", jsonRect.name, state,  orientationRect);
                break;
            }
        }
        if(rect.isSet()){
            return;
        }
        if(state=="default"){
            console.warn("AppLayout.setJsonRectBoundsToState() incomplete calculation : ", jsonRect.name, state,  orientationRect, rect.toString());
            return;
        }
        updateRectToState(_calcRect, jsonRect, "default");//TODO: Review, could lead to problems?
        rect.replaceNullValuesFrom(_calcRect);
    };
    var _calcRect = new Rectangle();//TODO: see comment in usage

    var _jsonRectangles = [];
    var crunchLayoutTree = function(jsonRect){
        _jsonRectangles.length = 0;
        var childJsonRect, childName;
        for(childName in jsonRect.rectangles){
            childJsonRect = jsonRect.rectangles[childName];
            childJsonRect.parent = jsonRect;
            childJsonRect.bounds = childJsonRect.bounds || new Rectangle();
            childJsonRect.name = childName;
            _jsonRectangles[childName] = childJsonRect;
            updateRectToState(childJsonRect.bounds, childJsonRect, "default");
            //console.log("=====> crunchLayoutTree()", childName, childJsonRect.bounds.toString());
            if(childJsonRect.rectangles){
                crunchLayoutTree(childJsonRect);//recurse
            }
        }
    };

    var _layoutName;
    AppLayout.resize = function(x, y, width, height){
        this.bounds.update(x, y, width, height);
        if(AppLayout.bounds.isSquareish(.2)){
            _layoutName = "square";
        }else{
            _layoutName = AppLayout.bounds.isLandscape() ? "landscape" : "portrait";
        }
        crunchLayoutTree(AppLayout);
        //this.debugLayout();
    };

    AppLayout.debugLayout = function(){
        var canvas = getDebugCanvas();
        drawLayoutTree(canvas.getContext("2d"), AppLayout);
    };

    AppLayout.debugRect = function(rectangle, containerRect, color){
        containerRect = containerRect || AppLayout.bounds;
        var context = getDebugCanvas().getContext("2d");
        context.fillStyle = color || MathUtil.getRandomRGBAColorString(.4);
        context.fillRect(containerRect.x + rectangle.x, containerRect.y + rectangle.y, rectangle.width, rectangle.height);
    };

    var _debugCanvas;
    function getDebugCanvas(){
        _debugCanvas = _debugCanvas || document.createElement("canvas");
        _debugCanvas.width = AppLayout.bounds.width;
        _debugCanvas.height = AppLayout.bounds.height;
        _debugCanvas.style.position = "absolute";
        _debugCanvas.style.zIndex = 600;
        document.body.appendChild(_debugCanvas);
        return _debugCanvas;
    };

    var drawLayoutTree = function(context, jsonRect){
        var childJsonRect, childName;
        for(childName in jsonRect.rectangles){
            childJsonRect = jsonRect.rectangles[childName];
            context.fillStyle = MathUtil.getRandomRGBAColorString(.4);
            context.fillRect(jsonRect.bounds.x + childJsonRect.bounds.x, jsonRect.bounds.y + childJsonRect.bounds.y, childJsonRect.bounds.width, childJsonRect.bounds.height);
            console.log("drawLayoutTree()", childName, childJsonRect.bounds.toString());
            if(childJsonRect.rectangles){
                drawLayoutTree(context, childJsonRect);//recurse
            }
        }
    };

/*
,
        shareContainer : {
            default: {
                l: {x: .2, y: .2, w: .8, h: .8},
                s: {x: .1, y: .1, w: .9, h: .9},
                v: {x: .05, y: .05, w: .9, h: .9}
            },
            transitionFrom: {
                all: {x: 1.1}
            },
            transitionTo: {
                all: {x: -2.1}
            },
            avatar : {
                default: {
                    l: {x: .2, y: .2, w: .8, h: .8},
                    s: {x: .1, y: .1, w: .9, h: .9},
                    v: {x: .05, y: .05, w: .9, h: .9}
                }
            },
            title : {
                default: {
                    l: {x: .2, y: .2, w: .8, h: .8},
                    s: {x: .1, y: .1, w: .9, h: .9},
                    v: {x: .05, y: .05, w: .9, h: .9}
                }
            },
            suggestions : {
                default: {
                    l: {x: .2, y: .2, w: .8, h: .8},
                    s: {x: .1, y: .1, w: .9, h: .9},
                    v: {x: .05, y: .05, w: .9, h: .9}
                }
            },
            closeButton : {
                default: {
                    l: {x: .2, y: .2, w: .8, h: .8},
                    s: {x: .1, y: .1, w: .9, h: .9},
                    v: {x: .05, y: .05, w: .9, h: .9}
                }
            }
        }
*/


}());