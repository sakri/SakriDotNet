//PORTFOLIO
//['$rootScope', '$scope', '$location' , '$timeout' 'portfolioService', 'analyticsService', portfolioController]);
function portfolioController($rootScope, $scope, $location, $timeout, portfolioService, analyticsService, colorService) {

    var canvas = document.createElement("canvas");
    canvas.width = 80;
    canvas.height = 80;
    var context = canvas.getContext("2d");
    context.font = "bold 24px sans-serif";
    context.textBaseline = "top";

    $scope.currentImagePath = "";
    $scope.project = undefined;

    //styles for layout
    $scope.thumbsScrollerStyle = {};
    $scope.thumbsListStyle = {"display" : "none"};
    $scope.leftButtonStyle = {"display" : "none"};
    $scope.rightButtonStyle = {"display" : "none"};
    $scope.thumbsListStyle = {};
    $scope.thumbsListContainerStyle = {};

    $scope.portfolioImageVisible = false;
    $scope.flashVisible = false;

    $scope.yearProjects = [];
    $scope.displayYear = 0;

    var scrollPosition = 0;
    var year;
    var yearProjectIndex = 0;//only used for deep linking
    var yearIndex = 0;

    var thumbSize = 70;

    var showNextProjectImagePromise, projectImageIndex;

    //todo, these are set in the css, should not be set twice...
    var thumbSpacer = 12;//images have a border of 3px and margin of 6px
    var thumbsWidth = 0;
    var thumbsVisibleWidth = 0;//used for scrolling
    var infoBoxMaxWidth = "400";
    var infoBoxMaxHeight = "400";

    function setLoadingStyles(){
        //$scope.portfolioImageVisible = false;
        //$scope.flashVisible = false;
        $scope.thumbsScrollerStyle["display"] = "none";
        $scope.leftButtonStyle["display"] = "none";
        $scope.rightButtonStyle["display"] = "none";
        $scope.thumbsListStyle["left"] = "0px";
        scrollPosition = 0;
    }

    setLoadingStyles();

    showProjectFromLocation();

    $rootScope.$on("$locationChangeSuccess", function(){
        showProjectFromLocation();
    });

    //decides the position of year widget and scroller, width of scroller and whether to show left+right buttons along with layout of infoButton and infoPanel
    function setLoadedStyles(){
        if(!$scope.yearProjects ){
            setLoadingStyles();
            return;
        }
        $scope.thumbsScrollerStyle["display"] = "inline-block";

        var containerWidth = $rootScope.containerRect.width;
        if(thumbsWidth + 90 + 22 > containerWidth){
            //console.log("show scroller, thumbsWidth : " , thumbsWidth, "containerWidth : ", containerWidth);
            //take up full space with portfolio controls elements
            if(isTouchDevice()){
                $scope.thumbsListContainerStyle["overflow"] = "auto";
            }else{
                $scope.leftButtonStyle["display"] = "inline";
                $scope.rightButtonStyle["display"] = "inline";
            }
            thumbsVisibleWidth = containerWidth - 130;//calender widget is 80px wide
            $scope.thumbsScrollerStyle["width"] = thumbsVisibleWidth + "px";
            $scope.thumbsListContainerStyle["width"] = thumbsWidth +  "px";
            $scope.thumbsListStyle["width"] = thumbsWidth + "px";
            console.log("thumbsVisibleWidth" , thumbsVisibleWidth);
        }else{
            //console.log("no scroller, thumbsWidth : " , thumbsWidth, "containerWidth : ", containerWidth);
            //center portfolio controls elements
            $scope.leftButtonStyle["display"] = "none";
            $scope.rightButtonStyle["display"] = "none";
            thumbsVisibleWidth = thumbsWidth + 10;//plus 10 just in case
            $scope.thumbsScrollerStyle["width"] = thumbsWidth + "px";
            $scope.thumbsListContainerStyle["width"] = thumbsWidth +  "px";
            $scope.thumbsListStyle["width"] = thumbsWidth + "px";
        }
        $scope.thumbsListStyle["left"] = "0px";//remove scrolling
        scrollPosition = 0;
    }

    function isTouchDevice() {
        return !!('ontouchstart' in window);
    }

    $scope.$on("resize-start", function(){
        cancelImageRotation();
        $scope.$evalAsync(function() {
            setLoadingStyles();
        });
    });

    $scope.$on("commit-resize", function(event){
        if($scope.project){
            showProject();
        }
    });


    function showProjectFromLocation(){
        var targetYear;
        cancelImageRotation();
        var path = $location.path().split("/");
        if(path.indexOf("portfolio")==-1){
            return;
        }
        path.shift();
        var availableYears = portfolioService.getAvailableYears();
        yearIndex = availableYears.length-1;//default to latest year
        yearProjectIndex = -1;

        if(path.length>1){
            var index = availableYears.indexOf( path[1] );
            if(index>-1){
                //$location year is valid
                yearIndex = index;
            }
        }
        targetYear = availableYears[yearIndex];


        $scope.yearProjects = portfolioService.getProjectsForYear(targetYear);

        if(path[2]){
            yearProjectIndex = getProjectIndex($scope.yearProjects, path[2].split("_").join(" "));//returns -1 if not valid
        }
        yearProjectIndex = yearProjectIndex >-1 ? yearProjectIndex : $scope.yearProjects.length-1;

        $scope.project = $scope.yearProjects[yearProjectIndex];
        for(var i=0; i<$scope.yearProjects.length; i++){
            $scope.yearProjects[i].thumbClass = $scope.yearProjects[i] == $scope.project ? "selectedThumb" : "portfolioThumbnailsListImg";

        }

        thumbsWidth = $scope.yearProjects.length * (thumbSize + thumbSpacer);

        year = availableYears[yearIndex];
        $scope.displayYear = year;

        //console.log("showProjectFromLocation()", year, yearIndex, yearProjectIndex);

        showProject();

        $scope.thumbProjects = [];

        $timeout(commitThumbs, 100);//hack, otherwise thumbs just wouldn't show up
    }

    $scope.thumbProjects = [];

    function commitThumbs(){
        $scope.$evalAsync(function() {
            $scope.thumbProjects = $scope.yearProjects;
        });
        $scope.renderNormal();
    }


    function showProject(){
        if(portfolioService.clientHasFlash && $scope.project.swfs){
            $scope.flashVisible = true;
            $scope.portfolioImageVisible = false;
        }else{
            projectImageIndex = -1;
            $scope.portfolioImageVisible = true;
            $scope.flashVisible = false;
            showNextProjectImage();
        }
        //console.log("show-project portfolio controller");
        $rootScope.$broadcast("show-project", $scope.project);
        analyticsService.logPortfolioProject($scope.project.title);
        setLoadedStyles();
    }

    function getProjectDimensions(){
        var size = {width:0, height:0};
        if(portfolioService.clientHasFlash && $scope.project.swfs){
            size.width = parseInt($scope.project.swfs.swf._width);
            size.height = parseInt($scope.project.swfs.swf._height);
        }else{
            size.width = parseInt($scope.project.images._width);
            size.height = parseInt($scope.project.images._height);
        }
        return size;
    }

    function getProjectIndex(projects, projectName){
        for(var i=0; i<projects.length; i++){
            if(projects[i].title == projectName){
                return i;
            }
        }
        return -1;
    }

    $scope.projectThumbnailClickHandler = function(project){
        navigateToProject(project);
    }

    function navigateToProject(project){
        setLoadingStyles();
        $scope.$evalAsync(function() {
            $location.path("portfolio/"+project.year+"/"+project.title.split(" ").join("_"));
        });
    }

    $scope.openYearOptions = function(){
        $rootScope.$broadcast("show-year-selector", $scope.displayYear);
    }



    function updatePortfolioNavigationButtons(){

    }

    $scope.previousClick = function(){
        var previousProject = portfolioService.getPreviousProject($scope.project);
        if(previousProject){
            navigateToProject(previousProject);
        }
        analyticsService.logPreviousProjectClick();
    }

    $scope.nextClick = function(){
        var nextProject = portfolioService.getNextProject($scope.project);
        if(nextProject){
            navigateToProject(nextProject);
        }
        analyticsService.logNextProjectClick();
    }

    //===========================================
    //==============::THUMBS SCROLLER::=================
    //===========================================

    var scrollDirection = 0;
    var scrollSpeed = 5;
    var scrollPromise;
    $scope.startScroll = function(direction){
        scrollDirection = direction;
        scrollThumbs();
    }

    $scope.scrollButtonDownHandler = function(){
        scrollSpeed = 12;
    }

    $scope.scrollButtonUpHandler = function(){
        scrollSpeed = 5;
    }

    function scrollThumbs(){
        scrollPosition += scrollDirection * scrollSpeed;
        if(scrollDirection==1 && scrollPosition>=0){
            scrollPosition = 0;
            updateScroll();
            return;
        }
        if(scrollDirection==-1 && scrollPosition <= thumbsVisibleWidth-thumbsWidth-15){
            scrollPosition = thumbsVisibleWidth-thumbsWidth-15;
            updateScroll();
            return;
        }
        updateScroll();
        scrollPromise = $timeout(scrollThumbs, 50);
    }

    function updateScroll(){
        $scope.thumbsListStyle["left"] = scrollPosition + "px";
    }

    $scope.stopScroll = function(direction){
        if (scrollPromise) {
            $timeout.cancel(scrollPromise);
        }
    }

    //===========================================
    //==============::IMAGE ROTATOR::=================
    //===========================================

    function showNextProjectImage(){
        cancelImageRotation();
        projectImageIndex++;
        projectImageIndex %= $scope.project.images.image.length;
        $scope.$evalAsync(function() {
            $scope.currentImagePath = $scope.project.images.image[projectImageIndex];
        });
        if($scope.project.images.image.length>1){
            var speed = $scope.project.images._rotationSpeed ? parseInt($scope.project.images._rotationSpeed) : 2000;
            showNextProjectImagePromise = $timeout(showNextProjectImage, speed);
        }
    }

    function cancelImageRotation(){
        if (showNextProjectImagePromise) {
            $timeout.cancel(showNextProjectImagePromise);
        }
    }



    //TODO: Move to a service
    //===========================================
    //==============::CALENDER BUTTON::=================
    //===========================================
    $scope.calenderClickHandler = function(event){
        $rootScope.$broadcast("show-year-selector", $scope.displayYear);
    }

    $scope.renderNormal = function(){
        render(colorService.headerColor, colorService.white);
    }

    $scope.renderOver = function(){
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
        var fontSize = getFontSizeForWidth($scope.displayYear, bgRect.width-handleHeight *.8 );
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

}
