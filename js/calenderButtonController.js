/**
 * Created by sakri on 13-8-14.
 */
function calenderButtonController($rootScope, $scope, colorService, canvasTextService){
    //TODO: Move to a service
    //===========================================
    //==============::CALENDER BUTTON::=================
    //===========================================

    var canvas = document.createElement("canvas");
    canvas.width = 80;
    canvas.height = 80;
    var context = canvas.getContext("2d");
    context.font = "bold 24px sans-serif";
    context.textBaseline = "top";
    $scope.displayYear = 0;

    $scope.$on("show-project", function(event, project){
        $scope.displayYear = project.year;
        $scope.renderNormal();
    });

    $scope.calenderClickHandler = function(event){
        $rootScope.$broadcast("show-year-selector", $scope.displayYear);
    }

    $scope.renderNormal = function(){
        renderCalenderButton(colorService.headerColor, colorService.white);
    }

    $scope.renderOver = function(){
        renderCalenderButton(colorService.white, colorService.headerColor);
    }

    var bgRect, handle1Rect, handle2Rect;

    function renderCalenderButton(color1, color2){
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
        var fontSize = canvasTextService.getFontSizeForWidth(canvas, $scope.displayYear, bgRect.width-handleHeight *.8 );
        context.fillStyle = color2;
        context.fillText($scope.displayYear,  handleHeight * .5, bgRect.y + handleHeight * 1.7);
        $scope.calenderSrc = canvas.toDataURL();
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
}