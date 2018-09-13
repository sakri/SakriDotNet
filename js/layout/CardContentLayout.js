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