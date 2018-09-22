/**
 * DEPENDENCIES:
 * utils MathLib, Rectangle
 */

(function() {

    window.Card = function(index) {

        //PUBLIC VARIABLES
        this.bounds = new Rectangle();
        this.tabBounds = new Rectangle();
        this.animateFromBounds = new Rectangle();
        this.animateToBounds = new Rectangle();

        //PRIVATE VARIABLES
        var _debugColor = "rgba(255, 0, 0, .3)";
        var _hasContent = false;

        this.hasContent = function(){
            return _hasContent;
        };

        //TODO: Should be moved to some "animations" class
        this.interpolateToAnimationBounds = function (normal) {
            this.bounds.update(
                MathUtil.interpolate(normal, this.animateFromBounds.x, this.animateToBounds.x),
                MathUtil.interpolate(normal, this.animateFromBounds.y, this.animateToBounds.y),
                MathUtil.interpolate(normal, this.animateFromBounds.width, this.animateToBounds.width),
                MathUtil.interpolate(normal, this.animateFromBounds.height, this.animateToBounds.height)
            );
        };

        //something is still not quite right. clicking near the tab produces some unexpected hits
        this.containsPoint = function(x, y){
            if(this.bounds.containsPoint(x,y)){
                if(y > this.bounds.y + this.tabBounds.bottom()){
                    return true;
                }
                return this.tabBounds.containsPoint(x - this.bounds.x, y - this.bounds.y);
            }
            return false;
            //return this.hitBounds.containsPoint(x - this.bounds.x, y - this.bounds.y) || this.tabBounds.containsPoint(x - this.bounds.x, y - this.bounds.y);
        };


        //******************************************
        //*******::RENDER TO CANVAS::*********
        //*************************

        var _tabLabelBounds = new Rectangle();
        this.render = function (context, data, renderCardContents) {
            if (!data) {
                _hasContent = false;
                return;
            }
            _hasContent = true;

            renderCardBG(context, data, this.bounds, this.tabBounds);

            var bounds;
            if (data.tabTitleImage) {
                _tabLabelBounds.x = Math.round(this.tabBounds.x + this.tabBounds.height * 1.2);
                _tabLabelBounds.width = Math.round(this.tabBounds.width - this.tabBounds.height * 2);//data.tabTitleImage.width
                _tabLabelBounds.height = (_tabLabelBounds.width / data.tabTitleImage.width) * data.tabTitleImage.height;
                _tabLabelBounds.y = this.bounds.y + this.tabBounds.height / 2 - _tabLabelBounds.height/2;

                context.drawImage(data.tabTitleImage, _tabLabelBounds.x, _tabLabelBounds.y, _tabLabelBounds.width, _tabLabelBounds.height);
            }

            if(!renderCardContents){
                return;
            }

            if (data.thumbnailImage) {
                bounds = data.contentLayout.thumbBounds;
                //console.log("Card.render() rendering image", bounds.toString());
                context.drawImage(data.thumbnailImage,
                    this.bounds.x + Math.round(bounds.x * this.bounds.width),
                    this.bounds.y + Math.round(bounds.y * this.bounds.height),
                    Math.round(bounds.width * this.bounds.width),
                    Math.round(bounds.height * this.bounds.height));
            }

            if (data.storyImage) {
                //console.log("Card.render() rendering story : ", data.contentLayout.storyBounds.toString());
                bounds = data.contentLayout.storyBounds;
                context.drawImage(data.storyImage,
                    this.bounds.x + Math.round(bounds.x * this.bounds.width),
                    this.bounds.y + Math.round(bounds.y * this.bounds.height),
                    Math.round(bounds.width * this.bounds.width),
                    Math.round(bounds.height * this.bounds.height));
            }
        };

        var renderCardBG = function(context, data, bounds, tabBounds ){

            //these two variables are a quick fix, layout is not being updated during intro/zoom animations
            //resulting in protruding tabs, this is a temporary fix
            var tabWidth = Math.min(tabBounds.width , bounds.width);
            var tabX = MathUtil.clamp(tabBounds.x , bounds.x, bounds.right() - tabWidth);


            context.lineWidth = 1;//try .5
            context.strokeStyle = "rgba(50, 50, 50, .2)";//MathUtil.getRandomRGBColorString();//
            context.fillStyle = "#FFFFFF";//data.themeColor; //MathUtil.getRandomRGBAColorString(.2);
            //context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

            var tabCornerRadius = tabBounds.bottom();//why not height?
            var tabCenterWidth = tabWidth - tabCornerRadius;//this is a bug.. should be tabCornerRadius * 2

            //Top Left Corner to tab
            context.beginPath();
            context.moveTo(bounds.x, bounds.y + tabCornerRadius);
            context.lineTo(tabX, bounds.y + tabCornerRadius);

            //Left side of tab Semi sphere
            context.arc(tabX + tabCornerRadius, bounds.y + tabCornerRadius , tabCornerRadius, Math.PI, Math.PI * 1.5);

            //tab top
            context.lineTo(tabX + tabCenterWidth, bounds.y);

            //Right side of tab Semi sphere
            context.arc(tabX + tabCenterWidth, bounds.y + tabCornerRadius, tabCornerRadius, Math.PI * 1.5, MathUtil.PI2);

            //rest of card
            context.lineTo(bounds.right(), bounds.y + tabCornerRadius);//top right
            context.lineTo(bounds.right(), bounds.bottom());//bottom right
            context.lineTo(bounds.x, bounds.bottom());//bottom left
            context.lineTo(bounds.x, bounds.y + tabCornerRadius);//top left
            context.closePath();

            context.save();
            context.shadowColor = "rgba(0, 0, 0, .2)";
            var side = Math.min(bounds.width, bounds.height);
            context.shadowBlur = Math.round(side * .04);
            context.shadowOffsetX = Math.round(side * -.02);
            context.shadowOffsetY = Math.round(side* .03);

            context.fill();
            context.stroke();
            context.restore();

            //Theme color graphic
            var circleX = tabX + tabCornerRadius * .8;
            var circleY = bounds.y + tabCornerRadius * .6;
            var circleRadius = tabCornerRadius * .2;

            context.fillStyle = data.themeColor;
            context.beginPath();
            //context.moveTo(tabX + tabCornerRadius * .65, tabBounds.y + tabCornerRadius * .5);
            context.arc(circleX, circleY, circleRadius * .75, 0, Math.PI * 2);
            context.fill();
            context.closePath();

            context.save();
            if(data.visited){
                context.beginPath();
                context.lineWidth = Math.ceil(tabCornerRadius * .04);
                context.strokeStyle = "#FFFFFF";//MathUtil.getRandomRGBColorString();//
                if(data.storyReadComplete){
                    context.lineCap="round";
                    _visitedCheckBounds.update(circleX - circleRadius, circleY - circleRadius, circleRadius*2, circleRadius*2);
                    context.moveTo( _visitedCheckBounds.x + _visitedCheckBounds.width * .3,
                        _visitedCheckBounds.y + _visitedCheckBounds.height * .5);
                    context.lineTo( _visitedCheckBounds.x + _visitedCheckBounds.width * .45,
                        _visitedCheckBounds.y + _visitedCheckBounds.height * .7);
                    context.lineTo( _visitedCheckBounds.x + _visitedCheckBounds.width * .7,
                        _visitedCheckBounds.y + _visitedCheckBounds.height * .35);
                }else{
                    context.arc(circleX, circleY, circleRadius * .55, 0, Math.PI * 2);
                }
                context.stroke();
                context.restore();
            }

        };
        var _visitedCheckBounds = new Rectangle();
    }
}());