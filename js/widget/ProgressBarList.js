/**
 * DEPENDENCIES:
 * utils MathLib, Rectangle
 */

(function() {

    //TODO: currently only tested to render with 6 items. Will most likely require some updates to support different lengths
    //TODO: consider renaming to ProgressBarListRenderer, or better
    window.ProgressBarList = function(completeCallback){

        //public API

        //when ItemHeight > compactMaxHeight, renders title and bar on 2 rows, otherwise both in same row
        this.setCompactMaxHeight = function(value){
            _compactMaxHeight = value;
        };

        //does not take effect until render is called
        this.setStyles = function(fontFace, fontColor, barColor, bgColor){
            _fontFace = fontFace || _fontFace;
            _fontColor = fontColor || _fontColor;
            _barColor = barColor || _barColor;
            _bgColor = bgColor || _bgColor;
        };

        // @data Array of : {label:String, normal:Number} , normal must be A number between 0 and 1.
        this.update = function(canvas, bounds, data){
            resize(canvas, bounds, data);
            animateUpdate(data);
        };

        //stops animation, "clears" state by setting animation to null. Plays intro on next update
        this.stop = function(){
            stop();
        };

        this.dataComplete = function (data){
            return dataComplete(data);
        };


        //private properties and methods

        var _fontFace = "Helvetica,Arial,sans-serif",
            _fontSize = 10,
            _fontColor = "#222222",
            _barColor = "#AAAAAA",
            _bgColor = "#FFFFFF",
            _canvas, _context,
            _resizeBounds = new Rectangle(),
            _spacer, _itemHeight,
            _numBars = 0,
            _renderFunction, _getBarRectFunction, _getLabelRectFunction, /* TODO: unnecessary state management, update*/
            _centerY = 0,
            _animator,
            _barDataList = [],
            _compactMaxHeight = 60;

        var stop = function(){
            if(_animator){
                _animator.stop();
                _animator = null;
            }
        };

        var resize = function(canvas, bounds, data){
            if(!_resizeBounds.equals(bounds) || data.length !== _numBars){
                if(data.length !== _numBars){
                    stop();//TODO: check if safe, doesn't do anything for the moment?
                }
                _numBars = data.length;
                _itemHeight = bounds.height / data.length;
                _spacer = _itemHeight * .25;
                _itemHeight = Math.floor((bounds.height - (data.length - 1) * _spacer) / data.length);
                _resizeBounds.updateToRect(bounds);
                _centerY = Math.floor(_itemHeight * .5);
                if(_itemHeight > _compactMaxHeight){
                    _renderFunction =  renderListItem;
                    _getBarRectFunction = getBarRectForIndex;
                    _getLabelRectFunction = getLabelRectForIndex;
                    _fontSize = Math.floor(_centerY * .5);
                }else{
                    _renderFunction = renderListItemCompact;
                    _getBarRectFunction = getBarRectCompactForIndex;
                    _getLabelRectFunction = getLabelRectCompactForIndex;
                    _fontSize = Math.floor(_itemHeight * .4);
                }
                updateTransitionData();
                _canvas = canvas;
                _context = CanvasUtil.setLayoutBounds(_canvas, bounds);
                _context.font = "bold " + _fontSize + "px " + _fontFace;
                _context.textBaseline = "middle";//top, bottom, middle, alphabetic, hanging
            }
        };

        var animateUpdate = function(incomingData){
            if(!_animator){
                playIntroAnimation(incomingData, render);
            }else if(dataComplete(incomingData)){
                playCompleteAnimation(incomingData);
            }else{
                playUpdateAnimation(incomingData);
            }
        };

        var dataComplete = function(dataList){
            var complete = 0;
            for(var i=0; i < _numBars; i++){
                complete += dataList[i].normal === 1 ? 1 : 0;
            }
            return complete === dataList.length;
        };

        var initTransitionData = function(incomingData){
            var i, data, barData;
            for(i = 0; i < incomingData.length; i++){
                data = incomingData[i];
                barData = _barDataList[i] || {};
                barData.label = data.label;
                barData.normal = 0;
                barData.color = (data.color || _barColor);
                barData.transitionData = barData.transitionData || {duration:300, widthEase:UnitEasing.easeOutSine};
                barData.labelRect = _getLabelRectFunction(i, barData.labelRect);
                barData.fromRect = _getBarRectFunction(i, barData.fromRect);
                barData.fromRect.width = 0;
                barData.toRect = barData.toRect || new Rectangle();
                barData.toRect.updateToRect(barData.fromRect);
                barData.transition = TransitionStore.getTransition("BarListTransition" + i, barData.fromRect, barData.toRect, barData.transitionData);
                _barDataList[i] = barData;
            }
            _barDataList.length = incomingData.length;//remove any trailing incomingData items if previous udpates had longer lists
        };

        var updateTransitionData = function(){
            var i, oldWidth, data, barData;
            for(i = 0; i < _barDataList.length; i++){
                barData = _barDataList[i];
                barData.labelRect = _getLabelRectFunction(i, barData.labelRect);
                oldWidth = barData.fromRect.width;
                barData.fromRect = _getBarRectFunction(i, barData.fromRect);
                barData.fromRect.width = oldWidth;
                oldWidth = barData.toRect.width;
                barData.toRect = _getBarRectFunction(i, barData.toRect);
                barData.toRect.width = oldWidth;
                barData.transition = TransitionStore.getTransition("BarListTransition" + i, barData.fromRect, barData.toRect, barData.transitionData);
            }
        };

        var playBarsAnimation = function(animations, updateCallback, completeCallback){
            _animator = AnimationStore.getChainedAnimation( "ProgressBarListAnimator",  animations, updateCallback, completeCallback);
            _animator.play();
            render();
        };

        var getActiveAnimations = function(incomingData){
            var i, animations = [], data, barData;
            for(i=0; i < _numBars; i++){
                data = incomingData[i];
                barData = _barDataList[i];
                if(barData.normal !== data.normal){
                    barData.fromRect.width = barData.toRect.width;
                    barData.toRect.width = Math.round(data.normal * _canvas.width);
                    barData.transition = TransitionStore.getTransition("BarListTransition" + i, barData.fromRect, barData.toRect, barData.transitionData);
                    animations.push( AnimationStore.getAnimation("BarListAnim" + i, barData.transition) );
                    barData.normal = data.normal;
                }
            }
            return animations;
        };

        var playIntroAnimation = function(incomingData){
            initTransitionData(incomingData);
            playBarsAnimation(getActiveAnimations(incomingData), render);
        };

        var playUpdateAnimation = function(incomingData){
            stop();
            playBarsAnimation(getActiveAnimations(incomingData), render, null, true);
        };

        var playCompleteAnimation = function(incomingData){
            stop();
            initTransitionData(incomingData);
            playBarsAnimation(getActiveAnimations(incomingData).reverse(), updateCompleteAnimation, completeCallback);
        };

        var updateCompleteAnimation = function(normal, rect){
            render();
            //render plus (particles?!)
        };

        var getYForBarIndex = function(index){
            return Math.round(index * (_itemHeight + _spacer));
        };

        //Standard render in 2 rows : text v-centered on top row, bar aligned to top of second row
        var getBarRectForIndex = function(index, rect){
            var y = getYForBarIndex(index);
            rect = rect || new Rectangle();
            rect.update(0, y + _centerY, _canvas.width, Math.round(_centerY * .5));
            return rect;
        };
        var getLabelRectForIndex = function(index, rect){
            var y = getYForBarIndex(index);
            rect = rect || new Rectangle();
            rect.update(0, Math.round(y + _centerY * .5), _canvas.width);//height is irrelevant
            return rect;
        };

        //Compact render : bar and text rendered v-centered in one row
        var getBarRectCompactForIndex = function(index, rect){
            var y = getYForBarIndex(index);
            rect = rect || new Rectangle();
            var margin = _itemHeight * .2;
            rect.update(0, Math.round(y + margin), _canvas.width, Math.round(_itemHeight - margin * 2));
            return rect;
        };
        var getLabelRectCompactForIndex = function(index, rect){
            var y = getYForBarIndex(index);
            rect = rect || new Rectangle();
            var margin = Math.floor(_itemHeight * .2);
            rect.update(margin, y + _centerY, _canvas.width - margin);//height is irrelevant
            //renderLabelCompact(data, Math.floor(_itemHeight * .2),  data.transition.rectangle.y + _centerY);
            return rect;
        };


        var render = function(){
            _context.clearRect(0, 0, _canvas.width, _canvas.height);
            for(var i=0; i < _numBars; i++){
                _renderFunction( _barDataList[i]);//label, normal, transition
            }
        };

        //data must contain {label:String, normal:Number}
        var renderListItem = function(barData){
            renderBar(barData.transition.rectangle, barData.color);
            renderLabel(barData);
        };

        var renderListItemCompact = function(barData){
            renderBar(barData.transition.rectangle, barData.color);
            renderLabelCompact(barData);
        };

        var renderBar = function(bounds, color){
            _context.fillStyle = _bgColor;
            _context.fillRect(0, bounds.y, _canvas.width, bounds.height);
            _context.fillStyle =  color;
            _context.fillRect(0, bounds.y, bounds.width, bounds.height);
        };

        var renderLabel = function(barData){
            _context.fillStyle = _fontColor;
            _context.fillText(barData.label, barData.labelRect.x, barData.labelRect.y);
        };

        var renderLabelCompact = function(barData){
            renderLabel(barData);
            var maxWidth = Math.round(_canvas.width * barData.normal) - barData.labelRect.x;
            if(maxWidth < barData.labelRect.x){
                return;
            }
            var measureString = barData.label + "";
            //safe, will measure 0 if string is "";
             //But pointless, fillText has maxWidth prop already
            while(_context.measureText(measureString).width > maxWidth){
                measureString = measureString.substr(0, measureString.length - 1);
            }
            //console.log("renderLabelCompact() measureString : ", measureString);
            _context.fillStyle = _bgColor;
            _context.fillText(measureString, barData.labelRect.x, barData.labelRect.y);
        };

    };
}());