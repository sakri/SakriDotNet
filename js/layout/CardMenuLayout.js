//updateLayout() must be called after AppLayout.updateLayout(). TODO: reconsider
(function() {

    //positions are "absolute"
    window.CardMenuLayout = {};//object, no need to instantiate
    CardMenuLayout.fullSizeCard = new Rectangle();
    CardMenuLayout.fullSizeCardHeaderHeight = 0;
    CardMenuLayout.fullYDragDistance = 0;

    CardMenuLayout.updateLayout = function(){
        calculateCardValues();
        this.fullSizeCard.updateToRect(_fullSizeCard);
        this.fullYDragDistance = Math.round(this.fullSizeCard.height * .5);
        CardMenuLayout.fullSizeCardHeaderHeight = this.fullSizeCard.y - AppLayout.cardBounds.y;
    };

    //TODO: consider restricting updates to minimum normal changes (performance, or might become jerky?)
    CardMenuLayout.updateCardBoundsToScrollNormal = function(cardBounds, tabBounds, index, normal){
        if(index < 4){
            var radian = MathUtil.interpolate(normal, _cornerRadians[index], _cornerRadians[index + 1]);
            cardBounds.x = _rightCornerCenterX + Math.cos(radian) * _cornerRadius;
            cardBounds.width = (cardBounds.x - AppLayout.bounds.centerX()) * 2;
            cardBounds.x -= cardBounds.width;
            radian = MathUtil.interpolate(normal, _cornerRadians[index], _cornerRadians[index + 1]);
            cardBounds.y = _fullSizeCard.y + Math.sin(radian) * _cornerRadius;
            cardBounds.height = _fullSizeCard.height * (cardBounds.width / _fullSizeCard.width);
        }else{
            cardBounds.x = _fullSizeCard.x;
            cardBounds.width = _fullSizeCard.width;
            cardBounds.height = _fullSizeCard.height;
            cardBounds.y = MathUtil.interpolate(normal, _cardYs[index], _cardYs[index + 1]);
        }
        var tabXNormal = MathUtil.clamp((cardBounds.y - AppLayout.cardBounds.y) / (_fullSizeCard.y - AppLayout.cardBounds.y), 0, 1);
        tabXNormal = UnitEasing.easeOutSine(tabXNormal);//apply easing
        tabBounds.x = (cardBounds.right() - _tabMinWidth) - tabXNormal * (cardBounds.width - _tabMinWidth);
        tabBounds.width = MathUtil.interpolate(tabXNormal, _tabMinWidth, _tabMaxWidth);
        tabBounds.height = MathUtil.interpolate(tabXNormal, _tabMinHeight, _tabMaxHeight);
    };

    var _cornerRadius, _rightCornerCenterX,
        _cornerRadians = [], _cardYs = [], _fullSizeCard = new Rectangle(),
        _tabMinWidth, _tabMinHeight, _tabMaxWidth, _tabMaxHeight;

    var calculateCardValues = function(){

        _cornerRadians.length = 0;
        _cornerRadius = Math.round(Math.min(AppLayout.cardBounds.width, AppLayout.cardBounds.height) * .1);
        _fullSizeCard.height = AppLayout.cardBounds.height - _cornerRadius;
        _fullSizeCard.width = Math.round(AppLayout.cardBounds.width *  (_fullSizeCard.height / AppLayout.cardBounds.height));
        _fullSizeCard.x = Math.round(AppLayout.bounds.centerX() - _fullSizeCard.width * .5);
        _fullSizeCard.y = AppLayout.cardBounds.y + _cornerRadius;

        _rightCornerCenterX = Math.round(AppLayout.bounds.centerX() + _fullSizeCard.width * .5 - _cornerRadius);

        var hMargin = AppLayout.cardBounds.x;
        _tabMinWidth = (_fullSizeCard.width - hMargin) / 5;
        _tabMaxWidth = _fullSizeCard.width * .65;
        _tabMinHeight = Math.round(Math.min(_fullSizeCard.width, _fullSizeCard.height) * .05);
        _tabMaxHeight = Math.round(Math.min(_fullSizeCard.width, _fullSizeCard.height) * .1);


        //REVIEW. Something smells redundant here
        //7 positions, arc has 5 positions, remaining 2 are along the same y axis
        var radianIncrement = MathUtil.HALF_PI / 4;
        var startRadian = Math.PI * 1.5;//positions are calculated from top of circle to 3 o'clock degrees clockwise
        for(var i=0; i < 5; i++){
            _cornerRadians[i] = startRadian + i * radianIncrement;
        }
        _cardYs = [0, 0, 0, 0, _fullSizeCard.y, Math.round(_fullSizeCard.centerY()), AppLayout.cardBounds.height];
    };

}());