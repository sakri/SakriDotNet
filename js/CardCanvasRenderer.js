/**
 * DEPENDENCIES:
 * MathLib, Rectangle, CardLayout
 */

//=============================================================
//==============::Canvas Text Util::=================
//=============================================================

//TODO: grab canvas text code from bottom of CardCanvasRenderer, move to own js file
(function() {

    /*
    var _textCanvas = document.createElement("canvas");
    _textCanvas.width = 400;//arbitrary number, may need to adjust later?
    _textCanvas.height = 400;
    */
    window.CanvasTextUtil = {};

    //TODO: find way to extract canvas text style from html element.

}());

//===================================================
//==============::CardCanvasRenderer::===============
//===================================================



(function() {

    window.CardCanvasRenderer = function(){

        //Public variables

        //Private variables
        var _renderCanvas, _renderContext,
            _titleFontColor = "#444444",
            _textFontColor = "#000000";

        //Public API

        this.createCardCanvasAssets = function(data, showReadMore){
            this.createTabTitleImage(data);
            this.createCardThumbnailImage(data);
            this.createCardThumbnailImageFromTitle(data);
            this.createCardStoryImage(data, showReadMore);
        };

        this.createTabTitleImage = function(data){
            //TODO: get a more scientific calculation going (estimate)
            updateRenderCanvas(Math.floor(AppLayout.cardBounds.width * .42), Math.floor(AppLayout.headerBounds.height * .8));
            renderTabTitleImage(data);
            data.tabTitleImage = createImageFromRenderCanvas(data.tabTitleImage);
        };

        //var thumbnailImageResize
        this.createCardThumbnailImage = function(data){
            if(!data.image){
                return;
            }
            updateRenderCanvas(
                Math.ceil(data.contentLayout.thumbBounds.width * AppLayout.cardBounds.width),
                Math.ceil(data.contentLayout.thumbBounds.height * AppLayout.cardBounds.height)
            );
            var percent = Math.min(
                 data.contentLayout.thumbBounds.width * AppLayout.cardBounds.width / data.image.width,
                 data.contentLayout.thumbBounds.height * AppLayout.cardBounds.height / data.image.height
            );
            try{
                _renderContext.putImageData(CanvasMultiPassResize.getImageData(data.image, percent, 2), 0, 0);
                data.thumbnailImage = createImageFromRenderCanvas(data.thumbnailImage);
            }catch(error){
                console.log("Error creating card image, generate missing image.");
                data.image = null;
                data.thumbnailImage = null;
                this.createCardThumbnailImageFromTitle(data);
            }
        };

        this.createCardThumbnailImageFromTitle = function(data){
             if(!data.image && data.title){
                 updateRenderCanvas(
                     Math.ceil(data.contentLayout.thumbBounds.width * AppLayout.cardBounds.width),
                     Math.ceil(data.contentLayout.thumbBounds.height * AppLayout.cardBounds.height)
                 );
                renderThumbnailFromTitle(data);
                data.thumbnailImage = createImageFromRenderCanvas(data.thumbnailImage);
            }
        };

        this.createCardStoryImage = function(data, showReadMore){
            updateRenderCanvas(
                Math.ceil(data.contentLayout.storyBounds.width * AppLayout.cardBounds.width),
                Math.ceil(data.contentLayout.storyBounds.height * AppLayout.cardBounds.height)
            );
            if(data.headline){
                renderStoryImage(data, showReadMore);
                data.storyImage = createImageFromRenderCanvas(data.storyImage);
            }
        };

        //Private methods

        var getTitleCanvasFontString = function(fontSize){
            return "bold " + fontSize + "px Helvetica,Arial,sans-serif";
        };

        var getTextCanvasFontString = function(fontSize){
            return  fontSize + "px Helvetica,Arial,sans-serif";
        };

        //Rendering

        var createImageFromRenderCanvas = function(image){
            if(!image){
                image = new Image();
            }
            image.src = _renderCanvas.toDataURL();
            image.width = _renderCanvas.width;
            image.height = _renderCanvas.height;
            return image;
        };

        var updateRenderCanvas = function(width, height){
            if(!_renderContext){
                _renderCanvas = document.createElement("canvas");
            }else{
                _renderContext.clearRect(0,0, _renderCanvas.width, _renderCanvas.height);
            }
            _renderCanvas.width = width;
            _renderCanvas.height = height;
            _renderContext = _renderCanvas.getContext("2d");
        };

        var renderTabTitleImage = function(data){
            //_renderContext.fillStyle = "#00FF00";
            //_renderContext.fillRect(0, 0, _renderCanvas.width, _renderCanvas.height);

            _renderContext.textBaseline = "middle";
            data.titleFontSize = Math.round(AppLayout.headerBounds.height * .5);
            _renderContext.fillStyle = _titleFontColor;
            _renderContext.textAlign = "left";

            var titleBounds = new Rectangle(0, 0, _renderCanvas.width, _renderCanvas.height);
            //var title = data.title.length
            data.titleFontSize = setContextAutoFitSingleLineFont(_renderContext, titleBounds, data.title, getTitleCanvasFontString, data.titleFontSize );
            _renderContext.fillText(data.title, 0, Math.round(_renderCanvas.height / 2));
        };


        var renderStoryImage = function(data, showReadMore){
            if(!data.headline){
                return;
            }
            data.textFontSize = Math.round(AppLayout.headerBounds.height * .35);

            data.textLineHeight = Math.round(data.textFontSize * 1.5);//try to avoid this
            _renderContext.font = getTextCanvasFontString(data.textFontSize);
            _renderContext.textBaseline = "top";
            _renderContext.fillStyle = _textFontColor;
            _renderContext.textAlign = "left";
            //from https://stackoverflow.com/questions/1981349/regex-to-replace-multiple-spaces-with-a-single-space
            var textWithoutWhitespace = data.headline.replace(/\s\s+/g, ' ');
            var textBottom = renderWrappedText(  _renderContext, textWithoutWhitespace,
                                                0,0,
                                                _renderCanvas.width, Math.round(_renderCanvas.height * 0.6),
                                                data.textLineHeight);
            if(showReadMore){
                _renderContext.textBaseline = "top";
                _renderContext.fillStyle = data.themeColor;
                _renderContext.font = getTextCanvasFontString(data.textFontSize);
                _renderContext.textAlign = "left";
                _renderContext.fillText("Click to read more", 0, textBottom + data.textLineHeight, _renderCanvas.width);
            }
        };

        var renderThumbnailFromTitle = function(data){
            _renderContext.fillStyle = data.themeColor;
            _renderContext.fillRect(0, 0, _renderCanvas.width, _renderCanvas.height);
            //console.log("CardCanvasRenderer.renderThumbnailFromTitle()", _renderCanvas.width, _renderCanvas.height);

            var fontSize = Math.floor(_renderCanvas.height * .33);//start with 3 lines
            _renderContext.textBaseline = "hanging";//top, bottom, middle, alphabetic, hanging
            _renderContext.fillStyle = "#FFFFFF";//TODO: See if this needs a variable of it's own
            _renderContext.textAlign = "left";

            var negativeMargin = Math.floor(AppLayout.cardBounds.x * .5);
            var bounds = {x:-negativeMargin, y:0, width:_renderCanvas.width + negativeMargin * 2, height:_renderCanvas.height};
            autoFitTextToContext(_renderContext, bounds, data.title, getTitleCanvasFontString, fontSize, .8);
        };


        //------------------------ CANVAS TEXT RENDERING
        //THE FOLLOWING METHODS should be in a CanvasText Util

        //Doesn't take linebreaks into account, goes outside bounds with a word that's too long
        //from https://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/ (meh)
        var renderWrappedText = function(context, text, x, y, maxWidth, maxY, lineHeight) {
            //console.log("renderWrappedText", text.substring(0, 100), x, y, maxWidth, maxY, lineHeight)
            var words = text.split(" ");
            var line = '', n, testLine, metrics, testWidth;
            for(n = 0; n < words.length; n++) {
                testLine = line + words[n] + " ";
                metrics = context.measureText(testLine);
                testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    context.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                }else {
                    line = testLine;
                }
                if(y > maxY){
                    return y;
                }
            }
            context.fillText(line, x, y);
            return y + lineHeight;
        };

        //does not render any text, basically a copy of renderWrappedText(), TODO: reconsider
        var attemptRenderWrappedText = function(context, text, x, y, maxWidth, maxY, lineHeight, _resultBounds) {
            //console.log("renderWrappedText", text.substring(0, 100), x, y, maxWidth, maxY, lineHeight)
            var resultBounds = _resultBounds || {};
            resultBounds.x = x;
            resultBounds.y = y;
            resultBounds.width = resultBounds.height = 0;

            var words = text.split(" ");
            var line = '', n, testLine, metrics, testWidth;
            for(n = 0; n < words.length; n++) {
                testLine = line + words[n] + " ";
                metrics = context.measureText(testLine);
                testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    resultBounds.width = Math.max(resultBounds.width, context.measureText(line).width );
                    line = words[n] + ' ';
                    y += lineHeight;
                }else {
                    line = testLine;
                    resultBounds.width = Math.max(resultBounds.width, metrics.width );
                }
                if(y > maxY){
                    resultBounds.height = y - resultBounds.y + lineHeight;
                    return resultBounds;
                }
            }
            resultBounds.width = Math.max(resultBounds.width, context.measureText(line).width );
            resultBounds.height = y - resultBounds.y + lineHeight;
            return resultBounds;
        };

        //TODO: Not sufficiently tested (seems to be ok)
        var setContextAutoFitSingleLineFont = function(context, bounds, text, stringFunc, defaultSize){
            var fontSize = defaultSize || bounds.height;
            //console.log("getAutoFitLineFontSize() w, h, fSize : ", bounds.width, bounds.height, fontSize);
            context.font = stringFunc(fontSize);
            var metrics = context.measureText(text);

            if(metrics.width > bounds.width){
                fontSize = Math.floor(fontSize * (bounds.width / metrics.width));
                //console.log("1) After h adjust fontSize : ", fontSize);
            }

            if(fontSize > bounds.height){
                fontSize = Math.floor(fontSize * (bounds.height / fontSize));
                //console.log("2) After v adjust fontSize : ", fontSize);
            }
            //console.log("3)Final fontSize : ", fontSize);
            context.font = stringFunc(fontSize);
            return fontSize;
        };

        //Currently only used by "render thumbnail from title"
        var autoFitTextToContext = function(context, bounds, text, stringFunc, defaultSize, lineHeightNormal){
            var fontSize = defaultSize;
            var renderBounds = {};
            var attempts = 0;
            do{
                context.font = stringFunc(fontSize);
                attemptRenderWrappedText(context, text, bounds.x, bounds.y, bounds.width, bounds.height, fontSize * lineHeightNormal, renderBounds);
                attempts++;
                fontSize--;
                if(attempts>100){
                    console.log("CardCanvasRenderer.autoFitTextToContext() took too long, exiting");
                    break;
                }
            }while(renderBounds.y > bounds.y + bounds.height || renderBounds.width > bounds.width);
            renderWrappedText(context, text, bounds.x, bounds.y, bounds.width, bounds.height, fontSize * lineHeightNormal);
            //console.log("CardCanvasRenderer.autoFitTextToContext() attempts : ", attempts, " fontSize:", fontSize, renderBounds);
        };

    };
}());