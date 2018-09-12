/**
 * DEPENDENCIES:
 * MathLib
 */


(function() {

    window.CanvasInteractionManager = function() {

        //PUBLIC VARIABLES

        //PRIVATE VARIABLES
        var _canvas,
            _interactionLocked = true,
            _boundMouseDown,
            _boundMouseMove,
            _boundMouseUp,
            _boundMouseOut,
            _touchStart,
            _touchEnd,
            _touchMove,
            _mouseCoordinates = {x:0, y:0};


        //**********************************
        //*******::PUBLIC API::*************
        //**********************************

        this.lockInteraction = function(){
            _interactionLocked = true;
        };

        this.unlockInteraction = function(){
            _interactionLocked = false;
        };

        this.isInteractionLocked = function(){
            return _interactionLocked;
        };

        this.setCanvas = function(canvas){
            if(!_boundMouseDown){
                _boundMouseDown = this.canvasMouseDownWithLockHandler.bind(this);
                _boundMouseMove = this.canvasMouseMoveWithLockHandler.bind(this);
                _boundMouseUp = this.canvasMouseUpWithLockHandler.bind(this);
                _boundMouseOut = this.canvasMouseOutHandler.bind(this);
                _touchStart = function (e) {
                    toucheEventHandler("mousedown", e);
                    e.preventDefault();
                };
                _touchEnd = function (e) {
                    toucheEventHandler("mouseup", e);
                    e.preventDefault();
                };
                _touchMove = function (e) {
                    toucheEventHandler("mousemove", e);
                    e.preventDefault();
                };
            }
            if(canvas === _canvas){
                return;
            }
            removeInteractivity();
            _canvas = canvas;
            addInteractivity();
        };

        //override these in implementation
        this.canvasMouseDownHandler = function(pointerPosition) {
            console.log("CanvasInteractionManager.canvasMouseDownHandler, override in implementation");
        };

        this.canvasMouseMoveHandler = function(pointerPosition) {
            console.log("CanvasInteractionManager.canvasMouseMoveHandler, override in implementation");
        };

        this.canvasMouseUpHandler = function(pointerPosition) {
            console.log("CanvasInteractionManager.canvasMouseUpHandler, override in implementation");
        };

        this.canvasMouseOutHandler = function(pointerPosition) {
            //console.log("CanvasApp.canvasMouseOutHandler(), override in subclasses");
        };

        //*******************************************
        //*******::INTERACTION LAYER::*************
        //**********************************

        var removeInteractivity = function(){
            if(!_canvas){
                return;
            }
            _canvas.removeEventListener("mousedown", _boundMouseDown);
            _canvas.removeEventListener("mousemove", _boundMouseMove);
            _canvas.removeEventListener("mouseup", _boundMouseUp);
            _canvas.removeEventListener("mouseout", _boundMouseOut);
            _canvas.removeEventListener("touchstart", _touchStart);
            _canvas.removeEventListener("touchend", _touchEnd);
            _canvas.removeEventListener("touchmove", _touchMove);
        }

        var addInteractivity = function(){

            _canvas.addEventListener("mousedown", _boundMouseDown, false);
            _canvas.addEventListener("mousemove", _boundMouseMove, false);
            _canvas.addEventListener("mouseup", _boundMouseUp, false);
            _canvas.addEventListener("mouseout", _boundMouseOut, false);
            _canvas.addEventListener("touchstart", _touchStart, false);
            _canvas.addEventListener("touchend", _touchEnd, false);
            _canvas.addEventListener("touchmove", _touchMove, false);

            /*
            //this didn't seem to be doing anything?!
            canvas.addEventListener("touchleave", function (e) {
                toucheEventHandler("mouseout", canvas, e);
                e.preventDefault();
            }, false);
            */
        };

        var _lastTouch, _mouseEventInitObj = {clientX:0, clientY:0};
        // Get the position of a touch relative to the canvas
        var toucheEventHandler = function(type, touchEvent) {
            if(type === "mouseup"){
                _mouseEventInitObj.clientX = _lastTouch.clientX;
                _mouseEventInitObj.clientY = _lastTouch.clientY;
                _lastTouch = null;
            }else{
                if(!touchEvent.touches.length){
                    //console.log("toucheEventHandler ", type, " NO TOUCHES, cancelling");
                    touchEvent.preventDefault();
                    return;
                }
                _lastTouch = touchEvent.touches[0];
                _mouseEventInitObj.clientX = _lastTouch.clientX;
                _mouseEventInitObj.clientY = _lastTouch.clientY;
            }
            //console.log("toucheEventHandler", type, pos.x, pos.y);
            var mouseEvent = new MouseEvent(type, _mouseEventInitObj);
            _canvas.dispatchEvent(mouseEvent);
        };

        // Get the position of the mouse relative to the canvas
        var getMousePos = function(mouseEvent) {
            var rect = _canvas.getBoundingClientRect();//this doesn't have to be recreated every time?
            _mouseCoordinates.x = mouseEvent.clientX - rect.left;
            _mouseCoordinates.y = mouseEvent.clientY - rect.top;
            return _mouseCoordinates;
        };

        this.canvasMouseDownWithLockHandler = function(e) {
            if(_interactionLocked){
                //console.log("CanvasInteractionManager.canvasMouseDownHandler blocked, interaction is locked");
                return;
            }
            this.canvasMouseDownHandler(getMousePos(e));
        };

        this.canvasMouseMoveWithLockHandler = function(e) {
            if(_interactionLocked){
                //console.log("CanvasInteractionManager.canvasMouseMoveHandler blocked, interaction is locked");
                return;
            }
            this.canvasMouseMoveHandler(getMousePos(e));
        };

        this.canvasMouseUpWithLockHandler = function(e) {
            if(_interactionLocked){
                //console.log("CanvasInteractionManager.canvasMouseUpHandler blocked, interaction is locked");
                return;
            }
            this.canvasMouseUpHandler(getMousePos(e));
        };

    }
}());