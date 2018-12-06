/**
 * Attempts to use an AJAX call to load an image, allowing for progress to be monitored for loaders
 * if Blob is not available, uses Image without progress
 * Due to security reasons, it seems a canvas cannot draw an image fetched like this
 * So, the ajax call is used to monitor progress, and the image is reloaded from cache.
 * If clientside caching is turned off, loading works, just without progress data
 * https://stackoverflow.com/questions/14218607/javascript-loading-progress-of-an-image
 */

(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;

    Sakri.ImageLoader = function() {

        //private properties
        var _request = new XMLHttpRequest();
        var _progressNormal = 0;
        var _image = new Image();

        this.getProgressNormal = function(){
            return _progressNormal;
        };

        //should have some failsafe checking if image has been fully loaded?
        this.getImage = function(){
            return _image;
        };

        this.load = function (url, progressCallback, completeCallback, errorCallback) {

            if(!Blob || !window.URL.createObjectURL){
                _loadImageFromCache(url, completeCallback, errorCallback);
                return;
            }else{
                _image.onload = function(){};
            }

            _request.onload = function( e ) {
                _progressNormal = 1;
                _loadImageFromCache(url, completeCallback, errorCallback);
            };

            _request.onprogress = function( e ) {
                if ( e.lengthComputable ){
                    _progressNormal = e.loaded / e.total ;
                    if(progressCallback){
                        progressCallback();
                    }
                }
            };

            _request.onerror = function(){
                if(errorCallback){
                    errorCallback();
                }
            };

            _request.open( 'GET', url , true );
            _request.responseType = 'arraybuffer';
            _request.send();

        };

        this.loadImageFromCache = function(url, completeCallback, errorCallback){
            _image.src = url;
            _image.onload = function(){
                this.onload = function(){};
                if(completeCallback){
                    completeCallback();
                }
            };
            _image.onerror = function(){
                if(errorCallback){
                    errorCallback();
                }
            };
        };

        var _loadImageFromCache = this.loadImageFromCache.bind(this);
    };

    window.Sakri.ImageLoader = Sakri.ImageLoader;

}(window));