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