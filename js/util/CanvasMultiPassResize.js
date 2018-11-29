(function() {

    var _copyCanvas1, _copyCanvas2;

    window.CanvasMultiPassResize = {};

    CanvasMultiPassResize.getImageData = function(img, percent, numPasses){
        percent = !percent ? 1 : Math.min(Math.max(.05, percent), 1);
        numPasses = !numPasses ? 1 : Math.min(Math.max(1, numPasses), 5);
        if(!_copyCanvas1){
            _copyCanvas1 = document.createElement('canvas');
            _copyCanvas2 = document.createElement('canvas');
        }
        var canvas = _copyCanvas1,
            context = _copyCanvas1.getContext('2d'),
            copyCanvas = _copyCanvas2,
            copyContext = _copyCanvas2.getContext('2d'),
            shrinkPercent = 1, swap;

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        for(var i=0; i<numPasses; i++){
            shrinkPercent = MathUtil.interpolate((i+1) / numPasses, 1, percent);
            //console.log("CanvasMultiPassResize", i, shrinkPercent);
            copyCanvas.width = img.width * shrinkPercent;
            copyCanvas.height = img.height * shrinkPercent;
            copyContext = copyCanvas.getContext('2d');
            copyContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, copyCanvas.width, copyCanvas.height);
            swap = canvas;
            canvas = copyCanvas;
            context = canvas.getContext('2d');
            copyCanvas = swap;
            copyContext = copyCanvas.getContext('2d');
        }
        return context.getImageData(0, 0, canvas.width, canvas.height);
    };


}());