(function() {

    //A different approach, the html template is served from the html page
    window.SharePanel = {};

    //Public api

    //template is a div containing :
    SharePanel.setTemplate = function(template){
        template.style.position = "fixed";
        template.style.zIndex = zIndex;
    };

    SharePanel.showSharePanel = function(template){
        console.log("SharePanel.createSharePanel()", zIndex);

        div.style.margin = div.style.padding = div.style.borderWidth = 0;
        //div.style.backgroundColor = "#00FFFF";
        div.style.display = "block";

        var canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.margin = canvas.style.padding = canvas.style.borderWidth = 0;
        div.appendChild(canvas);

    };

    //Private variables and methods

    var _thumbsupCanvas, _thumbsupContext,
        _exampleDiv;

}());