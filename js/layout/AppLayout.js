/**
 * Created by Sakri Rosenstrom on 24-08-18
 * Dependencies : MathUtil
 *

 */

//TODO: Replace with TangleUI implementation where possible, move rest to components?

(function() {

    //positions are "absolute"
    window.AppLayout = {};//object, no need to instantiate

    AppLayout.bounds = new Rectangle();
    AppLayout.cardBounds = new Rectangle();
    AppLayout.headerBounds = new Rectangle();

    AppLayout.cardImageDefaultBounds = new Rectangle();
    AppLayout.storyDefaultBounds = new Rectangle();

    AppLayout.updateLayout = function(width, height){
        if(width === this.bounds.width && height === this.bounds.height){
            return;
        }
        this.bounds.update(0, 0, width, height);
        var margin = Math.floor(Math.min(width, height) * .04);
        this.cardBounds.update(margin, margin, width - margin * 2, height - margin * 2);
        this.headerBounds.updateToRect(this.cardBounds);
        this.headerBounds.height = Math.round(Math.min(this.cardBounds.width, this.cardBounds.height) * .1);

        this.cardImageDefaultBounds.x = margin;
        this.cardImageDefaultBounds.y = this.headerBounds.bottom() + margin;
        //console.log("CardContentLayout updateLayout() img.x, y : ", this.thumbBounds.x, this.thumbBounds.y);
        if(this.bounds.isLandscape()){
            this.cardImageDefaultBounds.width = Math.round(this.cardBounds.width * .5 - margin * 2);
            this.cardImageDefaultBounds.height = Math.round(this.cardBounds.height * .7);
            this.storyDefaultBounds.updateToRect(this.cardImageDefaultBounds);
            this.storyDefaultBounds.x = this.cardBounds.width * .5 + margin;
        }else{
            this.cardImageDefaultBounds.width = this.cardBounds.width - margin * 2;
            this.cardImageDefaultBounds.height = Math.round(this.cardBounds.height * .3);
            this.storyDefaultBounds.updateToRect(this.cardImageDefaultBounds);
            this.storyDefaultBounds.y = this.cardImageDefaultBounds.bottom() + margin;
            this.storyDefaultBounds.height = this.cardBounds.height - this.storyDefaultBounds.y - margin;
        }
        //this.storyDefaultBounds.width -= this.cardBounds.x;
        //REMOVE
        CardMenuLayout.updateLayout(width, height);//Update to TangleUI
    };

}());





//updateLayout() must be called after AppLayout.updateLayout(). TODO: reconsider
(function() {

    //positions are "absolute"
    window.CardMenuLayout = {};//object, no need to instantiate
    CardMenuLayout.fullYDragDistance = 0;//Move to CardsMenu

    CardMenuLayout.updateLayout = function(){
        calculateCardValues();
        this.fullYDragDistance = this.getFullYDragDistance();
    };

    CardMenuLayout.getFullYDragDistance = function(){
        return Math.round(_fullSizeCard.height * .5);
    };

    //TODO: consider restricting updates to minimum normal changes (performance, or might become jerky?)
    CardMenuLayout.updateCardBoundsToScrollNormal = function(card, index, normal){
        var cardBounds = card.bounds;
        var tabBounds = card.tabBounds;
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

    //move to CardsMenu.calculateCustomLayout()
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



//Because Images can have different proportions, each "cardData" must have its own thumbBounds and storyBounds
(function() {

    //positions are "absolute", calculated to CardMenuLayout.fullSizeCard
    window.CardContentLayout = function(imageOriginalWidth, imageOriginalHeight) {

        //console.log("CardContentLayout constructor() : ", imageOriginalWidth, imageOriginalHeight);

        this.thumbBounds = new Rectangle();//normals relative to card dimensions
        this.storyBounds = new Rectangle();

        this.updateLayout = function(){

            //bounds are first calculated to full screen, then stored as normals pertaining to card width and height:
            //new Rect(10,10,90,90) app is 100by100 => rect(.1, .1, .9, .9)
            this.thumbBounds.update(0, 0, imageOriginalWidth, imageOriginalHeight);
            RectangleUtil.scaleRectDownTo(AppLayout.cardImageDefaultBounds, this.thumbBounds);

            this.storyBounds.updateToRect(AppLayout.storyDefaultBounds);

            this.thumbBounds.y = AppLayout.cardImageDefaultBounds.y;
            if(AppLayout.bounds.isPortrait()){
                this.thumbBounds.x = AppLayout.cardBounds.width * .5 - this.thumbBounds.width * .5;
                this.storyBounds.x = AppLayout.cardBounds.width * .5 - this.storyBounds.width * .5;
                this.storyBounds.y = this.thumbBounds.bottom() + AppLayout.cardBounds.x;
                this.storyBounds.height = AppLayout.cardBounds.height - this.storyBounds.y - AppLayout.cardImageDefaultBounds.x;
            }else{
                this.thumbBounds.x = AppLayout.cardBounds.width * .25 - this.thumbBounds.width * .5;
            }
            this.storyBounds.width -= AppLayout.cardImageDefaultBounds.x;

            //convert to normals
            this.thumbBounds.x /= AppLayout.cardBounds.width;
            this.thumbBounds.y /= AppLayout.cardBounds.height;
            this.thumbBounds.width /= AppLayout.cardBounds.width;
            this.thumbBounds.height /= AppLayout.cardBounds.height;

            this.storyBounds.x /= AppLayout.cardBounds.width;
            this.storyBounds.y /= AppLayout.cardBounds.height;
            this.storyBounds.width /= AppLayout.cardBounds.width;
            this.storyBounds.height /= AppLayout.cardBounds.height;

        };

        //Private methods

    }

}());