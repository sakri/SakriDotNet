(function() {

    window.CardImageCarousel = function(){

        //Public API

        this.load = function(images, parent, zIndex, bounds, defaultImage){
            _container = _container = document.createElement('div');
            _container.style.position = 'absolute';
            parent.appendChild(_container);
            HtmlUtil.showElement(_container, bounds);
            clearImages();
            _container.appendChild(_rotationImages[0]);
            _container.appendChild(_rotationImages[1]);
            clearImages();
            _currentIndex = -1;
            _loadStartTime = new Date().getTime();
            _imageStore.loadImages(images, loadProgress);
            if(defaultImage){
                _imageStore.unshiftLoadedImage(defaultImage);
                _rotationImages[0].style.opacity = 1;
                _rotationImages[0].src = defaultImage.src;
                _currentIndex = 1;
            }
            return _container;
        };

        var loadProgress = function(){
            if(_imageStore.numImages() == 2 && _rotateIntervalId===-1){
                var loadDuration = new Date().getTime() - _loadStartTime;
                if(loadDuration > _rotateIntervalDuration/2) {
                    nextImage();
                }
                _rotateIntervalId = setInterval(nextImage, _rotateIntervalDuration);
            }
        };

        this.loadComplete = function(){
          //console.log("CardImageCarousel.loadComplete()");
        };

        this.stop = function(){
            clearImages();
            clearInterval(_rotateIntervalId);
            _rotateIntervalId = -1;
        };

        //Private

        var _imageStore = new ImageStore(),
            _loadStartTime = 0,
            _rotationImages = [new Image(), new Image()],
            _container, _currentIndex = -1,
            _rotateIntervalDuration = 3000,
            _rotateIntervalId = -1, _startRotationCallback;

        var clearImages = function(){
            _rotationImages[0].style.transition = _rotationImages[1].style.transition = 'opacity 1s ease-in-out';
            _rotationImages[0].style.width = _rotationImages[1].style.width = '100%';
            _rotationImages[0].style.height = _rotationImages[1].style.height = '100%';
            _rotationImages[0].style.position = _rotationImages[1].style.position = 'absolute';
            _rotationImages[0].style.objectFit = _rotationImages[1].style.objectFit = 'cover';
            _rotationImages[0].style.opacity = _rotationImages[1].style.opacity = '0';
        };

        var nextImage = function(){
            //console.log("CardImageCarousel.nextImage()");
            _currentIndex++;
            _currentIndex %= _imageStore.numImages();
            var prev = _rotationImages.shift();
            var next = _rotationImages[0];
            //fade out prev
            //prev.style.display = 'none';
            prev.style.opacity = 0;
            //fade in next
            next.src = _imageStore.getImage(_currentIndex).src;
            next.style.opacity = 1;
            _rotationImages.push(prev);
        };

    };
}());