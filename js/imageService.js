/**
 * Created by sakri on 20-6-14.
 */
//IMAGE SERVICE
function imageService(){

    var currentLoadIndex, currentImage;

    var images = [];

    this.loadImages = function(urls, completeCallback, updateCallback){

        images = []
        currentLoadIndex = 0;
        loadNextImage();

        this.stop = function(){
            completeCallback = undefined;
            updateCallback = undefined;
            urls = [];
        };

        function loadNextImage(){
            if(currentLoadIndex >= urls.length){
                completeCallback(images);
                return;
            }
            currentImage = new Image();
            currentImage.onload = function(){
                imageLoadComplete();
            };

            currentImage.onerror = function(){
                alert("imageService ERROR : "+currentImage.src+" could not be loaded.");
                images.pop();//remove image from list if it did not load
                loadNextImage();
            };
            currentImage.src = urls[currentLoadIndex];
            images.push(currentImage);
            currentLoadIndex++;
        }

        function imageLoadComplete(){
            currentImage.onload = undefined;
            currentImage.onerror = undefined;
            if(updateCallback != undefined){
                updateCallback();
            }
            loadNextImage();
        }
    };

    //TODO create a MathUtil, figure out how to integrate into angular project
    function normalize(value, minimum, maximum){
        return (value - minimum) / (maximum - minimum);
    }

    this.getProgressPercent = function(){
        return normalize(currentLoadIndex, 0, urls.length);
    };

    this.getProgressString = function(){
        return currentLoadIndex + " / " + urls.length;
    };

    var thumbnailCanvas = document.createElement("canvas");

    this.createThumbnails = function(images, height){
        var i, image, context, ratio, thumbs = [];
        for(i=0; i<images.length;i++){
            image = images[i];
            ratio = height / image.height;
            thumbnailCanvas.height = height;
            thumbnailCanvas.width = Math.floor(image.width*ratio);
            context = thumbnailCanvas.getContext("2d");
            context.drawImage(image, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
            thumbs[i] = {width: thumbnailCanvas.width, height: thumbnailCanvas.height, src:thumbnailCanvas.toDataURL()};
            //thumbs[i] = context.getImageData(0, 0, thumbnailCanvas.width, thumbnailCanvas.height)
        }
        return thumbs;
    }

}
