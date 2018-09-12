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
        this.bounds.update(0, 0, width, height);
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

}());

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

//Because Images can have different proportions, each "cardData" must have its own thumbBounds and storyBounds
(function() {

    //positions are "absolute", calculated to CardMenuLayout.fullSizeCard
    window.CardContentLayout = function(imageOriginalWidth, imageOriginalHeight) {

        //console.log("CardContentLayout constructor() : ", imageOriginalWidth, imageOriginalHeight);

        //TODO: rename thumbBounds to thumbBounds
        this.thumbBounds = new Rectangle();
        this.storyBounds = new Rectangle();

        this.updateLayout = function(){
            this.thumbBounds.updateToRect(AppLayout.thumbDefaultBounds);
            this.storyBounds.updateToRect(AppLayout.storyDefaultBounds);
            //console.log("CardContentLayout updateLayout() img.x, y : ", this.thumbBounds.x, this.thumbBounds.y);
            this.thumbBounds.height = imageOriginalHeight;
            if(imageOriginalWidth <= AppLayout.thumbDefaultBounds.width && imageOriginalHeight <= AppLayout.thumbDefaultBounds.height){
                this.thumbBounds.width = imageOriginalWidth;
            }else{
                if(imageOriginalWidth > AppLayout.thumbDefaultBounds.width){
                    this.thumbBounds.width = AppLayout.thumbDefaultBounds.width;
                    this.thumbBounds.height = (this.thumbBounds.width / imageOriginalWidth) * imageOriginalHeight;
                }
                if(this.thumbBounds.height > AppLayout.thumbDefaultBounds.height){
                    this.thumbBounds.height = AppLayout.thumbDefaultBounds.height;
                    this.thumbBounds.width = (this.thumbBounds.height / imageOriginalHeight) * imageOriginalWidth;
                }
            }

            if(!AppLayout.bounds.isLandscape()){
                //STORY BOUNDS
                this.storyBounds.y = this.thumbBounds.bottom() + AppLayout.cardBounds.x;
                this.storyBounds.height = AppLayout.cardBounds.bottom() - this.storyBounds.y - AppLayout.cardBounds.x;
                //CENTER IMAGE
                this.thumbBounds.x = Math.round(AppLayout.bounds.centerX() - this.thumbBounds.width * .5);
            }

            //Values are stored as normals
            this.thumbBounds.x /= AppLayout.bounds.width;
            this.thumbBounds.y /= AppLayout.bounds.height;
            this.thumbBounds.width /= AppLayout.bounds.width;
            this.thumbBounds.height /= AppLayout.bounds.height;

            this.storyBounds.x /= AppLayout.bounds.width;
            this.storyBounds.y /= AppLayout.bounds.height;
            this.storyBounds.width /= AppLayout.bounds.width;
            this.storyBounds.height /= AppLayout.bounds.height;

        };

        //Private methods

    }

}());