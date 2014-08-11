/**
 * Created by sakri on 7-7-14.
 */

function calenderController($rootScope, $scope, $timeout, colorService){

    //$scope.yearSelectorStyle = {}

    var canvas, context, currentYear = 2013;

    this.initialize = function(element){
        canvas = element[0];
        canvas.addEventListener("click", canvasClickHandler);
        canvas.addEventListener("mouseover", mouseOverHandler);
        canvas.addEventListener("mouseout", mouseOutHandler);
        context = canvas.getContext("2d");
        context.font = "bold 24px sans-serif";
        context.textBaseline = "top";
    }

    function mouseOutHandler(){
        renderNormal();
    }

    function mouseOverHandler(){
        renderOver();
    }

    $scope.calenderStyle = {};

    $rootScope.$on('show-project', function (event, project) {
        //console.log("show project calender");
        currentYear = project.year;
        renderNormal();
    });

    function canvasClickHandler(event){
        $scope.$evalAsync(function() {
            $rootScope.$broadcast("show-year-selector", $scope.displayYear);
        });
    }

    function renderNormal(){
        render(colorService.headerColor, colorService.white);
    }

    function renderOver(){
        render(colorService.white, colorService.headerColor);
    }

    var bgRect, handle1Rect, handle2Rect;

    function render(color1, color2){
        context.clearRect(0, 0, canvas.width, canvas.height);
        var handleHeight = canvas.height *.2;
        handle1Rect = { x:canvas.width *.33 - handleHeight/4, y:0, width: handleHeight/2 , height: handleHeight};
        handle2Rect = { x:canvas.width *.66 - handleHeight/4, y:0, width: handleHeight/2 , height: handleHeight};
        bgRect = {x:0, y:handleHeight/2, width: canvas.width, height:canvas.height-handleHeight/2};

        context.fillStyle = color1;

        //BG
        renderRoundedRect(bgRect, handleHeight/2);
        context.fill();

        //WHITE RECT
        context.fillStyle = color2;
        context.fillRect(handleHeight/2, bgRect.y + handleHeight/2, bgRect.width-handleHeight, handleHeight);

        //HANDLES
        context.fillStyle = color1;
        renderRoundedRect(handle1Rect, handleHeight/5);
        context.fill();
        renderRoundedRect(handle2Rect, handleHeight/5);
        context.fill();

        //TEXT
        var fontSize = getFontSizeForWidth(currentYear, bgRect.width-handleHeight *.8 );
        context.fillStyle = color2;
        context.fillText(currentYear,  handleHeight * .5, bgRect.y + handleHeight * 1.7);

    }


    var halfPi = Math.PI/2;
    var pi2 = Math.PI*2;
    
    function renderRoundedRect (rect, radius){
        var right = rect.x + rect.width;
        var bottom = rect.y + rect.height;
        context.beginPath();
        context.moveTo(rect.x, rect.y + radius);
        context.arc(rect.x + radius, rect.y + radius, radius, Math.PI, Math.PI + halfPi);
        context.lineTo(right - radius, rect.y);
        context.arc(right - radius, rect.y + radius, radius, Math.PI + halfPi, pi2 );
        context.lineTo(right, bottom - radius);
        context.arc(right - radius, bottom - radius, radius, 0, halfPi );
        context.lineTo(rect.x + radius, bottom);
        context.arc(rect.x + radius, bottom - radius, radius, halfPi, Math.PI );
        context.lineTo(rect.x, rect.y + radius);
        context.closePath();
    }


    //TODO: Move into a service!! Repeated in yearSelectorController !!!
    //returns the biggest font size that best fits into rect
    function getFontSizeForWidth(string, width, minFontSize, maxFontSize){
        minFontSize = minFontSize || 8;
        maxFontSize = maxFontSize || 500;
        var fontSize = 80;
        context.font = "bold "+fontSize+"px sans-serif";
        var textWidth = context.measureText(string).width;

        if(textWidth < width){
            while(context.measureText(string).width < width){
                fontSize++;
                context.font = "bold "+fontSize+"px sans-serif";
                if(fontSize > maxFontSize){
                    console.log("getFontSizeForWidth() max fontsize reached");
                    return maxFontSize;
                }
            }
        }else if(textWidth > width){
            while(context.measureText(string).width > width){
                fontSize--;
                context.font = "bold "+fontSize+"px sans-serif";
                if(fontSize < minFontSize){
                    console.log("getFontSizeForWidth() min fontsize reached");
                    return minFontSize;
                }
            }
        }
        //console.log("getFontSizeForWidth() 2  : ", copy.fontSize);
        return fontSize;
    }


    //TODO: should be inherited or so, move to canvas.prototype or something. Also used in yearSElectorController
    var mousePosition = {};
    function setMousePosition(event) {
        var rect = canvas.getBoundingClientRect();
        if(event.touches && event.touches.length>0){
            mousePosition.x = event.touches[0].clientX - rect.left;
            mousePosition.y = event.touches[0].clientY - rect.top;
        }else{
            mousePosition.x = event.clientX - rect.left;
            mousePosition.y = event.clientY - rect.top;
        }
        return mousePosition;
    }

}
