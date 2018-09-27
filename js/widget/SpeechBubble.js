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
        //console.log("SpeechBubble.createSpeechBubble()", zIndex);
        var div = document.createElement("div");
        div.style.position = "fixed";
        div.style.zIndex = zIndex;
        div.style.margin = div.style.padding = div.style.borderWidth = 0;
        //div.style.backgroundColor = "#00FFFF";
        div.style.display = "block";

        var canvas = CanvasUtil.createCanvas(div);

        var title = document.createElement("p");
        title.style.position = "absolute";
        title.classList.add("unselectable");
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
    SpeechBubble.update = function(createdSpeechBubble, message, bounds){
        //console.log("SpeechBubble.update()", message);
        var index = _createdBubbles.indexOf(createdSpeechBubble);
        if(index == -1){
            console.warn("SpeechBubble.update() param:createdSpeechBubble must be instantiated by SpeechBubble.createSpeechBubble()");
            return;
        }
        //console.log("SpeechBubble.update()", width, height);
        createdSpeechBubble.style.width = bounds.width + "px";
        createdSpeechBubble.style.height = bounds.height + "px";
        //createdSpeechBubble.style.backgroundColor = "#FF0000";

        var bubbleElement = _bubbleElements[index];

        //background
        bubbleElement.canvas.width = bounds.width;
        bubbleElement.canvas.height = bounds.height;
        var context = bubbleElement.canvas.getContext("2d");

        //calculate bubble width:
        var fontSize = Math.round(bounds.height * .3);
        context.font = fontSize + "px Helvetica,Arial,sans-serif";
        var maxTextWidth = bounds.width * .9;
        var hMargin = bounds.width * .05;
        var bubbleWidth = Math.round(Math.min(context.measureText(message).width + hMargin * 2, maxTextWidth));

        createdSpeechBubble.style.width = bubbleWidth + "px";
        bubbleElement.canvas.width = bubbleWidth;
        var context = bubbleElement.canvas.getContext("2d");
        context.clearRect(0, 0, bounds.width, bounds.height);
        CanvasUtil.enablePixelArtScaling(context);

        SpeechBubbleSprite.render(context, 0, 0, bubbleWidth, bounds.height);

        //title
        bubbleElement.title.style.fontSize = fontSize + "px";
        bubbleElement.title.style.textAlign = "center";
        //bubbleElement.title.style.backgroundColor = "#FF0000";
        bubbleElement.title.style.left = "0px";
        bubbleElement.title.style.top = Math.round(bounds.height * .1) + "px";
        bubbleElement.title.style.width = bubbleWidth + "px";
        bubbleElement.title.style.height = Math.round(fontSize * 1.4) + "px";
        bubbleElement.title.innerHTML = message;
        return bubbleWidth;
    };


}());