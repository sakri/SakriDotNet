/**
 * Created by sakri on 13-8-14.
 * Renders the projects button on a Canvas element and sets the source to an image
 */
function projectsButtonController($rootScope, $scope, colorService, canvasTextService){
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
    var year = 0;

    $scope.$on("show-project", function(event, project){
        //console.log("projectsButtonController on show-project");
        year = project.year;
        $scope.renderProjectsNormal();
    });

    $scope.projectsClickHandler = function(event){
        $rootScope.$broadcast("show-projects-selector", year);
    }

    $scope.renderProjectsNormal = function(){
        renderProjects(colorService.headerColor, colorService.white);
    }

    $scope.renderProjectsOver = function(){
        renderProjects(colorService.white, colorService.headerColor);
    }

    var bgRect, handleRect;

    function renderProjects(color1, color2){
        //console.log("projectsButtonController.render()");
        context.clearRect(0, 0, canvas.width, canvas.height);
        var handleHeight = canvas.height *.2;
        handleRect = { x:canvas.width *.15, y:0, width: canvas.width*.35 , height: handleHeight};
        bgRect = {x:0, y:handleHeight/2, width: canvas.width, height:canvas.height-handleHeight/2};

        context.fillStyle = color1;

        //BG
        renderRoundedRect(bgRect, handleHeight/2);
        context.fill();

        //HANDLE
        context.fillStyle = color1;
        renderRoundedRect(handleRect, handleHeight/5);
        context.fill();

        //TEXT
        var fontSize = canvasTextService.getFontSizeForWidth(canvas, "PROJECTS", bgRect.width-handleHeight *.8 );
        context.fillStyle = color2;
        context.fillText("PROJECTS",  handleHeight * .5, canvas.height - handleHeight * .5 - fontSize);
        $scope.projectsSrc = canvas.toDataURL();
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