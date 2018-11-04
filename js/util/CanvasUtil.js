(function() {

    window.CanvasUtil = {};

    CanvasUtil.enablePixelArtScaling = function(context){
        context.imageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
    };

    CanvasUtil.createCanvas = function(parent, zIndex){
        //console.log("CanvasUtil.createCanvas()", width, height, zIndex);
        var canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.margin = "0";
        canvas.style.padding = "0";
        canvas.style.borderWidth = "0";
        if(!isNaN(zIndex)){
            canvas.style.zIndex = zIndex;
        }
        parent.appendChild(canvas);
        return canvas;
    };

    CanvasUtil.setLayoutBounds = function(canvas, bounds){
        var context = canvas.getContext("2d");
        if(bounds.width !== canvas.width ||  bounds.height !== canvas.height){
            canvas.width = bounds.width;
            canvas.height = bounds.height;
            context = canvas.getContext("2d");
            context.clearRect(0, 0, bounds.width, bounds.height);//shouldn't be necessary
        }
        canvas.style.left =  bounds.x + "px";
        canvas.style.top = bounds.y + "px";
        //console.log("CanvasUtil.setLayoutBounds()", canvas.width, canvas.height);

        return context;
    };

}());