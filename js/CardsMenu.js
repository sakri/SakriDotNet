/**
 * DEPENDENCIES:
 * MathLib, CanvasInteractionManager, DragManager
 */


(function() {

    window.CardsMenu = function(canvas, cardClickCallback){

        var _canvas,
            _context,

            _cards = [],
            _data = [],
            _dataIndex = 0,
            _scrollNormal = 0,

            _unitAnimator = new UnitAnimator(),
            _interactivityManager,
            _dragManager = new DragManager(),
            _overDrag = 0,
            _yScrollTarget = 0,
            _dragXOffset = 0,

            _selectedDataIndex,
            _cardClickHandler;

        for(var i=0; i < 6; i++){
            _cards[i] = new Card(i);
        }

        _canvas = canvas;
        _context = canvas.getContext("2d");
        _interactivityManager = new CanvasInteractionManager();
        //callbacks are set below beneath function declarations, TODO: cleanup, look for better solution
        _interactivityManager.setCanvas(_canvas);//meh
        _cardClickHandler = cardClickCallback;


        //******************************
        //*******::PUBLIC API::*********
        //******************************

        this.setData = function(data){
            if(!data || !data.length){
                console.log("CardsMenu.init() Error : invalid images, skipping");
                return;
            }
            _data = data.slice();
            _data.unshift(null, null, null, null);//4 empty items at the start
            _data.push(null);//1 empty item at the end
            resetAccordion();
            render();
            playIntro();
        };

        this.deselectCard = function(){
            animateSelectedCardOut();
        };

        this.enterPressHandler = function(){
            if(!_interactivityManager.isInteractionLocked()){
                executeCardClick(_cards[_cards.length - 2]);//TODO: has to check if has enough cards for following calculation!
            }
        };

        this.keyboardScrollHandler = function(direction){
            if(!_interactivityManager.isInteractionLocked()){
                resetScrollEasing();
                _yScrollTarget = direction;
                updateDragEase();
            }
        };

        this.show = function(value){
            _canvas.style.display = value ? "block" : "none";
        }

        //***********************************
        //*******::USER INTERACTIONS::*******
        //***********************************

        var canvasMouseDownHandler = function(pointer) {
            resetScrollEasing();
            _dragManager.startDrag(pointer);
        };

        var canvasMouseMoveHandler = function(pointer) {
            if(_dragManager.updateDrag(pointer)){
                handleYDrag(_dragManager.getYDragDistance() / CardMenuLayout.fullYDragDistance);
                render();
            }
        };

        //accordion.onclick = someFunction();//meh, should then expect an event, nein mann
        var canvasMouseUpHandler = function(pointer) {
            if(_dragManager.dragConsideredClick()){
                executeCardClick(getCardForPoint(pointer.x, pointer.y));
            }else{
                setYScrollTargetAfterDrag();
                updateDragEase();
            }
            _dragManager.reset();
        };

        var executeCardClick = function(card){
            if(!card){
                console.log("empty card click");
                return;
            }
            _selectedDataIndex = _dataIndex + _cards.indexOf(card);
            _selectedCard = card;
            resetScrollEasing();
            animateSelectedCardIn();
            AppData.storeInteraction();
        }

        //TODO: reconsider (see comment at top)
        _interactivityManager.canvasMouseDownHandler = canvasMouseDownHandler;
        _interactivityManager.canvasMouseMoveHandler = canvasMouseMoveHandler;
        _interactivityManager.canvasMouseUpHandler = canvasMouseUpHandler;

        var _scrollWheelTimeoutId = -1;//there doesn't seem to be an event for "scroll wheel end"
        this.scrollWheelUpdate = function(deltaX, deltaY){
            if(_interactivityManager.isInteractionLocked()){
                return;
            }
            resetScrollEasing();
            //console.log("accordion.updateScrollWheel : ", deltaX, deltaY);
            handleYDrag(-deltaY / CardMenuLayout.fullYDragDistance);
            clearTimeout(_scrollWheelTimeoutId);
            _scrollWheelTimeoutId = setTimeout(updateDragEase, 500);
            render();
        };

        //***********************
        //*******::LOGIC::*******
        //***********************

        var resetAccordion = function(){
            _scrollNormal = 0;
            _dataIndex = _data.length - _cards.length;
            resetScrollEasing();
        };

        var resetScrollEasing = function(){
            _overDrag = 0;
            _yScrollTarget = 0;
            _dragXOffset = 0;
        }

        var getCardForPoint = function(x, y){
            var i, card;
            for(i = _cards.length - 1; i > -1; i--){
                card = _cards[i];
                if(card.hasContent() && card.bounds.containsPoint(x, y)){
                    return card;
                }
            }
            return null;
        };

        var handleYDrag = function(dragYNormal) {
            var nextScrollNormal = _scrollNormal + dragYNormal;

            //DRAG LIMITS
            if (nextNormalExceedsScrollLimit(nextScrollNormal)) {
                _overDrag += dragYNormal;
                _overDrag = MathUtil.clamp(_overDrag, -20, 20);
                _overDrag *= .5;
                return;
            }
            incrementScrollNormal(dragYNormal);
        };

        var nextNormalExceedsScrollLimit = function(nextNormal){
            return (nextNormal > 1 && _dataIndex === 0) ||
                (nextNormal < 0 && _dataIndex === _data.length - _cards.length);
        };

        var incrementScrollNormal = function(normal){
            var nextScrollNormal = _scrollNormal + normal;
            _overDrag = 0;
            if(nextScrollNormal > 1){
                //GOING DOWN
                _dataIndex -= Math.floor(nextScrollNormal);
                _scrollNormal = nextScrollNormal % 1;
                if(_dataIndex < 0){
                    _dataIndex = _scrollNormal = 0;
                    //console.log("Accordion.incrementScrollNormal bottom reached");
                }
            }else if(nextScrollNormal < 0){
                //GOING UP
                _dataIndex += (Math.floor(Math.abs(nextScrollNormal)) + 1)
                _scrollNormal = 1 - nextScrollNormal % 1;
                if(_dataIndex > _data.length - _cards.length){
                    _dataIndex = _data.length - _cards.length;
                    _scrollNormal = 1;
                    //console.log("Accordion.incrementScrollNormal top reached");
                }
            }else{
                _scrollNormal = nextScrollNormal;
            }
        };

        var setYScrollTargetAfterDrag = function(){
            if(_overDrag){
                return;
            }
            var scrollSpeed = _dragManager.getYScrollSpeed();
            var numEaseIndices = Math.round(scrollSpeed / CardMenuLayout.fullYDragDistance * 20);//arbitrary number
            _yScrollTarget = numEaseIndices + (scrollSpeed > 0 ? 1 - _scrollNormal : _scrollNormal);
            //console.log("accordion.setYScrollTargetAfterDrag() ind, sNorm, yTarg :", numEaseIndices, _scrollNormal,  _yScrollTarget);
        };

        var updateDragEase = function(){
            //console.log("accordion.updateDragEase()", _yScrollTarget, _overDrag, _dragXOffset);
            if(_yScrollTarget){
                var incrementNormal = _yScrollTarget * .1;
                _yScrollTarget -= incrementNormal;
                if(Math.abs(_yScrollTarget) < .001 || nextNormalExceedsScrollLimit(_scrollNormal + incrementNormal)){
                    _yScrollTarget = 0;
                    //console.log("accordion.updateDragEase() y scroll ease complete");
                }else{
                    incrementScrollNormal(incrementNormal);
                }
            }
            if(_overDrag){
                _overDrag *= .5;
                if(Math.abs(_overDrag) < .001){
                    _overDrag = 0;
                }
            }
            render();
            if(_yScrollTarget || _overDrag || _dragXOffset){
                window.requestAnimationFrame(updateDragEase);
            }else{
                AppData.storeInteraction();//a drag is complete
            }
        };

        //*************************
        //*******::RENDER::********
        //*************************

        var render = function(){
            _context.fillStyle = appConfig.appBgColor;
            _context.fillRect(0, 0, _canvas.width, _canvas.height);
            var i, card;
            for(i=0; i<6; i++){
                card = _cards[i];
               //calculate max needed render height by referencing next position (optimization)
                CardMenuLayout.updateCardBoundsToScrollNormal(card.bounds, card.tabBounds, i, _scrollNormal);
                card.render(_context, _data[_dataIndex + i], i > 2);
            }
        };

        /*
        var logDebug = function(string){
            _context.font = "32px Helvetica,Arial,sans-serif";
            _context.fillStyle = "#0000FF";
            _context.textAlign = "left";
            _context.fillText(string, 20, _canvas.height - 50, _canvas.width * .8);
        };*/



        //*******::ANIMATION::*****
        //TODO: These should be moved to another class?

        //===============::INTRO::=========================

        var playIntro = function(){
            _interactivityManager.lockInteraction();
            var i, card;
            var startSpacer = 1 / (_cards.length + 1), endSpacer = 1 / (_cards.length), y;
            for(var i=0; i<_cards.length; i++){
                card = _cards[i];
                card.animateToBounds.updateToRect(card.bounds);
                card.animateFromBounds.updateToRect(card.bounds);
                card.animateFromBounds.y = -card.bounds.height * 1.2;
            }
            _unitAnimator.start(1500, renderIntroNextStep, introComplete);
        };

        var renderIntroNextStep = function(normal){
            _context.clearRect(0, 0, _canvas.width, _canvas.height);
            var i, card, introNormal;
            var startSpacer = 1 / (_cards.length + 1), endSpacer = 1 / (_cards.length), y;
            for(i=0; i<_cards.length; i++){
                introNormal = MathUtil.smoothstep(normal, startSpacer * i, endSpacer * (i+1));
                introNormal = i == _cards.length - 1 ? UnitEasing.easeOutBack(introNormal) : introNormal;
                card = _cards[i];
                card.bounds.y = MathUtil.interpolate(introNormal, card.animateFromBounds.y, card.animateToBounds.y);
                card.render(_context, _data[_dataIndex + i], true);
            }
        };

        var introComplete = function(){
            _interactivityManager.unlockInteraction();
            render();
        };

        //===============::ZOOM IN AND OUT::=========================

        var _selectedCard = null;
        var animateSelectedCardIn = function(){
            _interactivityManager.lockInteraction();
            _context.clearRect(0, 0, _canvas.width, _canvas.height);
            _selectedCard.animateFromBounds.updateToRect(_selectedCard.bounds);
            _selectedCard.animateToBounds.updateToRect(AppLayout.cardBounds);
            _unitAnimator.start(500, zoomCardToNormal, animateCardInComplete, UnitEasing.easeOutBack);
        }

        var animateSelectedCardOut = function(){
            _interactivityManager.lockInteraction();
            _context.clearRect(0, 0, _canvas.width, _canvas.height);
            _unitAnimator.start(500, animateCardOutUpdate, animateCardOutComplete, UnitEasing.easeInBack);
        };

        var zoomCardToNormal = function(normal){
            _context.clearRect(0, 0, _canvas.width, _canvas.height);
            _selectedCard.interpolateToAnimationBounds(normal);
            _selectedCard.render(_context, _data[_selectedDataIndex], true);
        };


        var animateCardInComplete = function(){
            _selectedCard.render(_context, _data[_selectedDataIndex], false);
            if(_cardClickHandler){
                _cardClickHandler(_selectedDataIndex- 4);//-4 because of null items
            }
        };

        var animateCardOutUpdate = function(normal){
            render();
            zoomCardToNormal(1 - normal);
        };

        var animateCardOutComplete = function(){
            _selectedDataIndex = null;//-1 ?
            _selectedCard = null;
            _interactivityManager.unlockInteraction();
            render();
        };

    };
}());