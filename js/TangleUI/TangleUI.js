/**
 * Created by Sakri Rosenstrom on 24-08-18
 * Dependencies : MathUtil
 *

 */


(function() {

    //positions are "absolute"
    window.TangleUI = {};//object, no need to instantiate

    TangleUI.bounds = new Rectangle();

    //rename to layoutDefinition, rectangleDefinitions, ???
    TangleUI.rectangles = [];

    TangleUI.setLayoutDefinitions = function(JsonLayout){
        this.rectangles = JsonLayout;
    };

    var _compareRect = new Rectangle();
    TangleUI.setLayoutBounds = function(x, y, width, height){
        _compareRect.update(x, y, width, height);
        if(this.bounds.equals(_compareRect)){
            return;
        }
        this.bounds.update(x, y, width, height);
        updateLayoutRectangles();
        //this.debugLayout();
    };

    //api only exposes calculated layout Rectangle bounds
    TangleUI.getRect = function(name, stateName){
        var layoutRect = getLayoutRect(name);
        return getLayoutRectStateBounds(layoutRect, stateName || "default");
    };

    //adjustedRect contains calculated values (not normals)
    //this adjustment is overridden when setLayoutBounds() is called, by defaults from layout json
    //components must be notified when setLayoutBounds occurs and are responsible for repeating this adjustment prior to render.
    TangleUI.setRect = function(layoutRectName, state, adjustedRect){
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
TangleUI.localToGlobal = function(layoutRectName){
    var jsonRect = getLayoutRect(layoutRectName);
    return localToGlobal(jsonRect, jsonRect.bounds);
};

    TangleUI.debugLayout = function(){
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
            console.warn("TangleUI.getLayoutRect() layoutRectName : ", layoutRectName, " is not available. Make sure updateLayout() has been called, or check TangleUI.rectangles");
            return;
        }
        return data;
    };

    var getLayoutRectState = function(layoutRect, stateName){
        var stateRect = layoutRect[stateName];
        if(!stateRect){
            console.warn("TangleUI.getLayoutRectState() state : ", stateName, " is not available in layoutRect : ", layoutRect.name ,". Please check TangleUI.rectangles");
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
                console.warn("TangleUI.setJsonRectBoundsToState() cannot calculate bounds for : ", layoutRect.name, stateName,  orientationRect);
                break;
            }
        }
        if(state.bounds.isSet()){
            return state.bounds;
        }
        if(stateName === "default"){
            console.warn("TangleUI.setJsonRectBoundsToState() incomplete default state calculation : ", layoutRect.name, " : " ,  orientationRect, ", result: ",  rect.toString());
            return;
        }
        state.bounds.replaceNullValuesFrom(layoutRect.default.bounds);
        return state.bounds;
    };

    var updateLayoutRectangles = function(){
        updateLayoutName();
        _layoutRectanglesLookup = {};//not really necessary
        TangleUI.default = {bounds : TangleUI.bounds};//little hack to enable traversal
        traverseLayoutRectangles(TangleUI);//bit awkward to pass "self" as a global variable to private method?
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
        if(TangleUI.bounds.isSquareish(.2)){
            _layoutName = "square";
        }else{
            _layoutName = TangleUI.bounds.isLandscape() ? "landscape" : "portrait";
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
        _debugCanvas.width = TangleUI.bounds.width;
        _debugCanvas.height = TangleUI.bounds.height;
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