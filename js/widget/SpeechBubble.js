(function() {

    window.SpeechBubble = {};

    //Just an idea I wanted to try, and ponder about.
    //Instead of composing or inherting from dom objects
    //SpeechBubble is a "static" "bubble controller", manages instantiating "populated divs" and their rendering
    //essentially a template factory

    var _createdBubbles = [];
    var _bubbleElements = [];

    //does not wrap text (yet)
    SpeechBubble.createSpeechBubble = function(parentElement, zIndex){
        console.log("SpeechBubble.createSpeechBubble()", zIndex);
        var div = document.createElement("div");
        div.style.position = "fixed";
        div.style.zIndex = zIndex;
        div.style.margin = div.style.padding = div.style.borderWidth = 0;
        //div.style.backgroundColor = "#00FFFF";
        div.style.display = "block";

        var canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.margin = canvas.style.padding = canvas.style.borderWidth = 0;
        div.appendChild(canvas);

        var title = document.createElement("p");
        title.style.position = "absolute";
        title.style.margin = title.style.padding = title.style.borderWidth = 0;
        div.appendChild(title);

        _createdBubbles.push(div);
        _bubbleElements.push({title:title, canvas:canvas});

        parentElement.appendChild(div);

        if(_createdBubbles.length > 100){
            console.warn("You've created more than 100 speechBubbles. Just saying...");
        }

        return div;
    };

    //bit of a heavy operation, shouldn't be called on requestAnimationFrame
    SpeechBubble.updateSpeechBubble = function(createdSpeechBubble, message, width, height){
        var index = _createdBubbles.indexOf(createdSpeechBubble);
        if(index == -1){
            console.warn("SpeechBubble.updateSpeechBubble() param:createdSpeechBubble must be instantiated by SpeechBubble.createSpeechBubble()");
            return;
        }
        //console.log("SpeechBubble.updateSpeechBubble()", width, height);
        createdSpeechBubble.style.width = width + "px";
        createdSpeechBubble.style.height = height + "px";

        var bubbleElement = _bubbleElements[index];

        //background
        bubbleElement.canvas.width = width;
        bubbleElement.canvas.height = height;
        var context = bubbleElement.canvas.getContext("2d");
        context.clearRect(0, 0, width, height);
        context.imageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;

        //calculate bubble width:
        var fontSize = Math.round(height * .3);
        context.font = fontSize + "px Helvetica,Arial,sans-serif";
        var maxTextWidth = width * .9;
        var hMargin = width * .05;
        var bubbleWidth = Math.min(context.measureText(message).width + hMargin * 2, maxTextWidth);

        SpeechBubbleSprite.render(context, width - bubbleWidth, 0, bubbleWidth, height);
        //context.fillStyle = "#000000";
        //context.fillText(message, 10, height * .75);

        //title
        bubbleElement.title.style.fontSize = fontSize + "px";
        bubbleElement.title.style.textAlign = "right";
        //bubbleElement.title.style.backgroundColor = "#FF0000";
        bubbleElement.title.style.left = Math.round(hMargin) + "px";
        bubbleElement.title.style.top = Math.round(height * .1) + "px";
        bubbleElement.title.style.width = Math.round(width - hMargin * 2) + "px";
        bubbleElement.title.style.height = Math.round(fontSize * 1.4) + "px";
        bubbleElement.title.innerHTML = message;
        //SpeechBubble.updateSpeechBubble
    };


}());