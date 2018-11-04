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

}());