/**
 * Created by Sakri Rosenstrom on 01-10-18
 * Dependencies : utils.js
 *
 *
 * =====================================================
 * =================:: TangleUI ::======================
 * ===== (mangle, rectangle, heh, it was all me) =======
 * =====================================================
 *
 * Is targeted at Single Page Applications which require Responsive Layouts inside the Html5 Canvas.
 * Separates basic layout and transition calculations from App and Component logic.
 * Centralizes layout/transition definitions and calculations.
 * Supports html elements whose position/transition depend on Canvas contents. (Negate repetition in JS/CSS)
 * Contains minimal animation capabilities
 *      - is not intended as a replacement for animation libraries like https://greensock.com/
 * Expects layout and transition definitions in specified json format* (TODO: create spec, add link)
 *      - layouts are defined as "percent value rectangles" relative to Landscape, Squarish and Vertical screen sizes
 * Is queried for layout Rectangles, Transitions and Animations
 *      - Apps call setLayoutBounds() at startup or resize, only default definitions are calculated
 *      - remaining calculations are made per query, results are cached until next resize
 *
 */


(function() {

    window.TangleUI = {};

    //PUBIC API

    TangleUI.setWindowResizeCallbacks = function(resizeStartCallback, resizeCallback, resizeFreezeDuration){
        setWindowResizeCallbacks(resizeStartCallback, resizeCallback, resizeFreezeDuration);
    };

    TangleUI.setLayoutDefinitions = function(JsonLayout){
        _layoutDefinitions = JsonLayout;
        calculateLayout();
    };

    //api only exposes calculated layout Rectangle bounds
    TangleUI.getRect = function(definitionName, stateName){
        return getRect(definitionName, stateName);
    };

    //adjustedRect contains calculated values (not normals)
    //adjustment is overridden when setLayoutBounds() is called, by defaults from layout json
    //components must be notified when setLayoutBounds occurs,
    //and are responsible for repeating this adjustment prior to render.
    TangleUI.setRect = function(adjustedRect, definitionName, stateName){
        return setRect(adjustedRect, definitionName, stateName);
    };


    //PRIVATE PROPERTIES AND METHODS

    var _bounds = new Rectangle(),
        _layoutDefinitions, /*JSON*/
        _rectCount = 0,
        _rectanglePool = [],
        _rectangles, /*Object*/
        _parentRectLookup, /*Object*/
        _layoutName = "horizontal", /*used to select corresponding layout rect*/
        _registeredToWindowResize = false,
        _resizeStartCallback = function(){},
        _resizeCallback = function(){},
        _resizeFreezeDuration,
        _windowResizeTimeoutId = -1

    var setWindowResizeCallbacks = function(resizeStartCallback, resizeCallback, resizeFreezeDuration){
        _registeredToWindowResize = false;
        _resizeStartCallback = resizeStartCallback || function(){};
        _resizeCallback = resizeCallback || function(){};
        _resizeFreezeDuration = resizeFreezeDuration || 300;
        window.addEventListener("resize", windowResizeHandler);
    };

    //Avoids repeatedly running resize logic by calling calculateLayout 300ms after last user resize action
    var windowResizeHandler = function () {
        if(_windowResizeTimeoutId == -1){
            _resizeStartCallback();
        }
        clearTimeout(_windowResizeTimeoutId);
        _windowResizeTimeoutId = setTimeout(calculateLayout, _resizeFreezeDuration);//arbitrary number
    };

    var calculateLayout = function () {
        //TODO: calculate x and y taking "max proportions" into account.
        _bounds.update(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
        _rectangles = {};
        _parentRectLookup = {};
        _rectCount = 0;
        _layoutName = getLayoutName(_bounds);
        calculateDefaultLayoutRectangles(_layoutDefinitions, _bounds);

        _windowResizeTimeoutId = -1;
        console.log("TangleUI.commitResize()", _bounds.toString());
        _resizeCallback();
    };


    //returns a calculated Rectangle instance (provided definitions are correctly set up)
    var getRect = function(definitionName, stateName){
        if(!definitionName){
            return _bounds;
        }
        var id = getRectId(definitionName, stateName);
        return _rectangles[id] || getStateRect(definitionName, stateName);//return cached value or create new
    };

    var getStateRect = function(definitionName, stateName){
        var definition = getDefinitionObjectByName(_layoutDefinitions, definitionName);
        if(!definition){
            console.warn("TangleUI.getStateRect() Warning : provided definitionName : ", definitionName, " not found")
        }
        var rect = createRectFromDefinitionState(definition, definitionName, stateName);
        //console.log("TangleUI.getStateRect() ", definitionName, stateName, rect.toString());
        return rect;
    };

    var getBoundsForDefinitionRect = function(definitionName){
        return _parentRectLookup[definitionName];//if this is null, something is not right in the definitions json
    };

    var setRect = function(adjustedRect, definitionName, stateName){
        // TODO:  (rect is Rectangle) instanceOf ???
        if(!adjustedRect.isSet){
            console.warn("TangleUI.setRect() Warning : provided adjustedRect : ", adjustedRect, " is not a valid Rectangle");
            return;
        }
        var bounds = getBoundsForDefinitionRect(definitionName);
        var rect = getRect(definitionName, stateName);
        rect.updateToRect(adjustedRect);
        rect.round();
        return rect;
    };

    //=============================== :: Rectangle "parsing" :: ================================

    //recursive search through "definition rectangles", only called when fetching state rectangles
    var getDefinitionObjectByName = function(rectDefinitionObject, definitionName){
        var childName, childDefinitionObject;
        for(childName in rectDefinitionObject){
            childDefinitionObject = rectDefinitionObject[childName];
            if(childName === definitionName){
                return childDefinitionObject;
            }
            if(childDefinitionObject.children){
                var rect = getDefinitionObjectByName(childDefinitionObject.children, definitionName);
                if(rect){
                    return rect;
                }
            }
        }
        return null;
    };

    //traverses recursively through all "definition rectangles"
    //creates and calculates "defaults", adds to _rectangles
    var calculateDefaultLayoutRectangles = function(rectDefinitionsObject, bounds){
        var childName, childDefinitionObject, childDefaultBounds;
        for(childName in rectDefinitionsObject){
            childDefinitionObject = rectDefinitionsObject[childName];
            _parentRectLookup[childName] = bounds;
            childDefaultBounds = createRectFromDefinitionState(childDefinitionObject, childName, "default");
            //console.log("TangleUI.calcRect()", childName, childDefaultBounds.toString());
            if(childDefinitionObject.children){
                calculateDefaultLayoutRectangles(childDefinitionObject.children, childDefaultBounds);
            }
        }
    };

    var getStateDefinitionObject = function(definitionObject, stateName){
        var state = definitionObject[stateName || "default"];
        if(!state){
            console.warn("TangleUI.getStateDefinitionObject() state : ", stateName, " is not available in definitionObject : ", definitionObject ,". Please check TangleUI._layoutDefinitions");
        }
        return state;
    };

    var createRect = function(definitionName, stateName){
        var rect, id = getRectId(definitionName, stateName);
        if(_rectanglePool.length > _rectCount){
            rect = _rectanglePool[_rectCount];
        }else{
            rect = new Rectangle();
            _rectanglePool.push(rect);
        }
        rect.update();
        _rectangles[id] = rect;
        _rectCount++;
        //console.log("createRect : ", id ,  _rectangles[id].toString());
        return rect;
    };

    var createRectFromDefinitionState = function(definitionObject, definitionName, stateName){
        //console.log("TangleUI.createRect()", definitionName, stateName);
        var rect = createRect(definitionName, stateName);
        var bounds = getBoundsForDefinitionRect(definitionName);
        //console.log("create 1 , parent bounds : ", bounds.toString());
        var stateDefinition = getStateDefinitionObject(definitionObject, stateName);
        var orientationRect = stateDefinition["all"] || stateDefinition[_layoutName];
        var numOrientationRectProps = getNumberOfPropertiesInOrientationRect(orientationRect);
        //console.log("TangleUI.createRectFromDef()", bounds.toString(), stateDefinition, orientationRect, numOrientationRectProps);
        var propName, value, loops = 0;
        //this can be optimized, no need to loop through all values every time
        //then again, a few conditionals might be faster than array manipulation in other solutions?
        while(rect.getNumberOfSetItems() < numOrientationRectProps){
            for(propName in rectNormalCalculator){
                value = orientationRect[propName];
                //console.log("update : ", propName, value, rect.toString());
                if(!isNaN(value)){
                    rectNormalCalculator[propName](rect, bounds, Number(value));//calls x(), y(), w, h, left() etc.
                }else if(!isNaN(rect[value])){
                    if(isRectangleProperty(propName)){
                        rect[propName] = rect[value];//propName == "x", "y", "width" or "height"
                    }else{
                        positionCalculator[propName](rect, bounds, rect[value]);//propName == "left", "right", "top", "bottom", "centerX", "centerY"
                    }
                }
            }
            if(++loops > 3){
                console.warn("TangleUI.setJsonRectBoundsToState() cannot calculate bounds for : ", definitionName, stateName,  orientationRect);
                break;
            }
        }
        if(!rect.isSet()){
            if(isDefaultStateName(stateName)){
                console.warn("TangleUI.setJsonRectBoundsToState() incomplete default stateDefinition calculation : ", definitionName, " : " ,  orientationRect, ", result: ",  rect.toString());
            }else{
                //console.log("create : replacing " + rect.toString() + " values from : ", getRect(definitionName).toString());
                rect.replaceNullValuesFrom(getRect(definitionName));
            }
        }
        rect.round();
        //console.log("create 2 , rect : ", rect.toString());
        return rect;
    };



    /*
TangleUI.localToGlobal = function(layoutRectName){
var jsonRect = getLayoutRect(layoutRectName);
return localToGlobal(jsonRect, jsonRect.bounds);
};

TangleUI.debugLayout = function(){
    renderDebugLayoutRects();
};*/

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
            if(childLayoutRect._layoutDefinitions){
                renderDebugLayoutRects(childLayoutRect, color);//recurse
            }
        }
    };
    */

    var isDefaultStateName = function(stateName){
        return !stateName || stateName === "default";
    };

    var getRectId = function(definitionName, stateName){
        return definitionName + (isDefaultStateName(stateName) ? "" : "_" + stateName);
    };

    var getLayoutName = function(bounds){
        var name = "";
        if(bounds.isSquareish(.2)){
            name = "square";
        }else{
            name = bounds.isLandscape() ? "landscape" : "portrait";
        }
        return name;
    };

    var getNumberOfPropertiesInOrientationRect = function(rect){
        var propCount = 0;
        for(var prop in rect){
            propCount += (positionCalculator[prop] ? 1: 0);
        }
        return propCount;
    };

    var isRectangleProperty = function(propName){
        return propName === "x" || propName === "y" || propName === "width" || propName === "height";
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

}());