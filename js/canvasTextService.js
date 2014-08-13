/**
 * Created by sakri on 12-8-14.
 */
function canvasTextService(){

    //TODO: Move into a service?!
    //returns the biggest font size that best fits into rect
    this.getFontSizeForWidth = function(canvas, string, width, minFontSize, maxFontSize){
        var context = canvas.getContext("2d");
        minFontSize = minFontSize || 8;
        maxFontSize = maxFontSize || 500;
        var fontSize = 80;
        context.font = "bold "+fontSize+"px sans-serif";
        var textWidth = context.measureText(string).width;

        if(textWidth < width){
            while(context.measureText(string).width < width){
                if(fontSize >= maxFontSize){
                    console.log("getFontSizeForWidth() max fontsize reached");
                    fontSize = maxFontSize;
                    break;
                }
                fontSize++;
                context.font = "bold "+fontSize+"px sans-serif";
            }
        }else if(textWidth > width){
            while(context.measureText(string).width > width){
                if(fontSize <= minFontSize){
                    fontSize = minFontSize;
                    console.log("getFontSizeForWidth() min fontsize reached");
                    break;
                }
                fontSize--;
                context.font = "bold "+fontSize+"px sans-serif";
            }
        }
        //console.log("canvasTextService.getFontSizeForWidth()  : ", fontSize);
        return fontSize;
    }

}