(function (window){

	window.ImageStore = function(){

        //Public API

        this.numImages = function(){
            return _images.length;
        };

        this.getImage = function(index){
            index = MathUtil.clamp(index, 0, _images.length-1);
            return _images.length ? _images[index] : null;
        };

        this.loadImages = function(urls, updateCallback, completeCallback){
            _urls = urls.slice();//copy
            //console.log('loadImages()', _urls.length);
            _completeCallback = completeCallback || _noop;
            _updateCallback = updateCallback;
            _images = [];
            _currentIndex = 0;
            loadNextImage();
        };

        this.unshiftLoadedImage = function(loadedImage){
            var image = getCreatedImage(_images.length);
            image.src = loadedImage.src;
            _images.unshift(image);
        }

        this.stop = function(){
            _completeCallback = undefined;
            _updateCallback = undefined;
        };

        this.getProgressNormal = function(){
            MathUtil.normalize(_currentIndex, 0, _urls.length);
        };

        this.getProgressString = function(){
            return _currentIndex + " / " + _urls.length;
        };

        //Private

        var _currentIndex = 0,
            _urls,
            _createdImages = [],
            _images,
            _noop = function(){},
            _updateCallback,
            _completeCallback;

        var loadNextImage = function(){
            if(_currentIndex >= _urls.length){
                //console.log("all images loaded");
                _completeCallback();
                return;
            }
            var image = getCreatedImage(_images.length, true);
            image.src = _urls[_currentIndex];
            _images.push(image);
            _currentIndex++;
            //console.log("loadNextImage(", _currentIndex, "/", _urls.length,") : ", _urls[_currentIndex - 1]);
        };

        var imageLoadComplete = function(){
            if(_updateCallback){
                _updateCallback();
            }
            loadNextImage();
        };

        var getCreatedImage = function(addListeners){
            var image;
            if(_images.length < _createdImages.length){
                image = _createdImages[_images.length];
            }else{
                image = new Image();
                _createdImages.push(image);
            }
            image.onload = addListeners ? imageLoadComplete : undefined;
            image.onerror = addListeners ? function(){
                console.log('ImageStore ERROR : image could not be loaded.');
                imageLoadComplete();
            } : undefined;
            return image;
        }

    };
}(window));