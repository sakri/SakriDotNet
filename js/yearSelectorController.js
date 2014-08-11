/**
 * Created by sakri on 7-7-14.
 */

function yearSelectorController($rootScope, $scope, $location, $timeout, colorService, portfolioService, analyticsService){

    $scope.yearSelectorStyle = {}

    $scope.showYearSelector = false;

    var canvas, context, currentYear, cellWidth, cellHeight, margin, gridX, fontSize;

    this.initialize = function(element){
        canvas = element[0];
        canvas.addEventListener("click", canvasClickHandler);
    }

    $scope.$on("show-year-selector", function(event, year){
        currentYear = year;
        $scope.showYearSelector = true;
        canvas.width = $rootScope.containerRect.width;
        canvas.height = $rootScope.containerRect.height;
        context = canvas.getContext("2d");

        context.font = "bold 24px sans-serif";
        context.textBaseline = "top";

        canvas.addEventListener("mousemove", canvasMouseMoveHandler);

        setSizes();
        renderYears();
    });

    function canvasClickHandler(event){
        setMousePosition(event);
        var targetYear = -1;
        if(gridContainsMouse()){
            targetYear = 1999 + getCurrentMouseCellIndex();
        }
        $scope.$evalAsync(function() {
            closeYearSelector();
            if(targetYear>-1 && targetYear!=currentYear && portfolioService.yearHasProjects(targetYear)){
                analyticsService.logPortfolioYear(targetYear);
                $location.path("portfolio/"+targetYear);
            }
        });
    }

    var isDirty = false;
    var moveCellIndex = -1;

    function gridContainsMouse(){
        return mousePosition.x > gridX && mousePosition.x < gridX + cellWidth*4 && mousePosition.y>0 && mousePosition.y<4*cellHeight;
    }

    //TODO: this relies on gridContainsMouse() being true... nicht gut!
    function getCurrentMouseCellIndex(){
        var x = Math.floor( (mousePosition.x - gridX) /  cellWidth );
        var y = Math.floor(mousePosition.y / cellHeight) ;
        return x + y*4;
    }

    var cursorStyle = "auto";
    function setCursor(over){
        var style = over ? "pointer" : "auto";
        if(cursorStyle != style){
            $scope.$evalAsync(function() {
                $scope.yearSelectorStyle["cursor"] = style;
            });
            cursorStyle = style;
        }
    }

    function canvasMouseMoveHandler(event){
        setMousePosition(event);
        if(gridContainsMouse()){
            setCursor(true);
            var currentMoveCellIndex = getCurrentMouseCellIndex();
            if(moveCellIndex != currentMoveCellIndex){
                moveCellIndex = currentMoveCellIndex;
                renderYears(1999 + moveCellIndex);
            }
            return;
        }else if(isDirty){
            renderYears();
            moveCellIndex = -1;
        }
        setCursor(false);
    }

    function closeYearSelector(){
        canvas.removeEventListener("mousemove", canvasMouseMoveHandler);
        $scope.showYearSelector = false;
    }

    function setSizes(){
        margin = $rootScope.containerRect.width > 800 ? .8 : 1;
        cellWidth = $rootScope.containerRect.width * margin / 4;
        cellHeight = cellWidth / 2;//TODO : double check that this works in all sizes?
        gridX = $rootScope.containerRect.width/2 - cellWidth*2;
        fontSize = getFontSizeForWidth("0000", cellWidth *.8);
        context.font = "bold "+fontSize+"px sans-serif";
    }

    function renderYears(overYear){

        context.fillStyle = colorService.subHeaderColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        isDirty = overYear!=undefined;

        var x, y, year;
        var xOffset = cellWidth*.1
        var yOffset = cellHeight / 2 - fontSize/2;

        for(var i=0; i<16; i++){
            year = 1999+i;
            x = gridX + (i%4)*cellWidth;
            y = 15 + Math.floor(i/4) * cellHeight;
            context.fillStyle = year == currentYear ? colorService.headerColor : colorService.subHeaderColor;
            context.fillRect(x, y, cellWidth, cellHeight);
            context.fillStyle = getYearTextColor(year, overYear);
            context.fillText(year, x+xOffset, y+yOffset );
        }

    }

    function getYearTextColor(year, overYear){
        if(year == currentYear){
            return colorService.white;
        }
        if(!portfolioService.yearHasProjects(year)){
            return colorService.gray;
        }
        if(year == overYear){
            return colorService.headerColor;
        }
        return colorService.white;
    }

    $scope.$on("resize-start", function(){
        closeYearSelector();
    });

    //TODO: should be inherited or so, move to canvas.prototype or something. Also used in calenderController
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

    //TODO: Move into a service?!
    //returns the biggest font size that best fits into rect
    function getFontSizeForWidth(string, width, minFontSize, maxFontSize){
        minFontSize = minFontSize || 8;
        maxFontSize = maxFontSize || 500;
        var fontSize = 80;
        context.font = "bold "+fontSize+"px sans-serif";
        var textWidth = context.measureText(string).width;

        //SOME DISAGREEMENT WHETHER THIS SHOOULD BE WITH && or ||
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


}
