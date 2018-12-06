(function() {

    window.HtmlUtil = {};

    //TODO:  doesn't seem "bullet proof", test, fix or find better solution
    HtmlUtil.measureTextWidth = function(string, fontSize, parent){
        var measureSpan = document.createElement("span");
        measureSpan.style.position = "absolute";
        parent.appendChild(measureSpan);
        //measureSpan.style.visibility = "hidden";
        measureSpan.style.whiteSpace = "nowrap";
        measureSpan.style.fontSize = fontSize + "px";
        measureSpan.innerHTML = string;
        //console.log("measureTextWidth() fs:", fontSize,  measureSpan.innerHTML , measureSpan.offsetWidth, "x6");
        var measuredWidth = measureSpan.offsetWidth;
        measureSpan.innerHTML = "";
        parent.removeChild(measureSpan);
        measureSpan = null;
        return measuredWidth;
    };

    HtmlUtil.showElement = function(element, bounds, display){
        if(!bounds || display === "none"){
            element.style.display = "none";//used to toggle visibility. TangleUI managed items use display:block, so no issue
            return;
        }
        element.style.display = display || "block";
        element.style.left = Math.round(bounds.x) + "px";
        element.style.top = Math.round(bounds.y) + "px";
        element.style.width = Math.round(bounds.width) + "px";
        element.style.height = Math.round(bounds.height) + "px";
    };

}());