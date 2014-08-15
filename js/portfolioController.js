//PORTFOLIO
function portfolioController($rootScope, $scope, $location, $timeout, portfolioService, analyticsService, colorService, canvasTextService) {

    $scope.currentImagePath = "";
    $scope.project = undefined;

    //styles for layout
    $scope.thumbsListStyle = {};

    $scope.portfolioImageVisible = false;
    $scope.flashVisible = false;

    $scope.yearProjects = [];
    $scope.displayYear = 0;

    $scope.showProjectsList = false;

    var year;
    var yearProjectIndex = 0;//only used for deep linking
    var yearIndex = 0;

    var thumbSize = 70;

    var showNextProjectImagePromise, projectImageIndex;

    //todo, these are set in the css, should not be set twice...
    var thumbSpacer = 12;//images have a border of 3px and margin of 6px
    var thumbsWidth = 0;
    var thumbsVisibleWidth = 0;
    var infoBoxMaxWidth = "400";
    var infoBoxMaxHeight = "400";

    $scope.showThumbs = true;

    function setLoadingStyles(){
        //$scope.portfolioImageVisible = false;
        //$scope.flashVisible = false;
        $scope.showProjectsList = false;
    }

    setLoadingStyles();

    showProjectFromLocation();

    $rootScope.$on("$locationChangeSuccess", function(){
        showProjectFromLocation();
    });

    //
    function setLoadedStyles(){
        $scope.showProjectsList = false;
        if(!$scope.yearProjects ){
            setLoadingStyles();
            return;
        }

        var containerWidth = $rootScope.containerRect.width;
        if(thumbsWidth + 90 + 22 > containerWidth){
            //show "projects" button instead of thumbs, clicking projects opens projects selector
            //console.log("show scroller, thumbsWidth : " , thumbsWidth, "containerWidth : ", containerWidth);
            thumbsVisibleWidth = containerWidth - 130;//calender widget is 80px wide
            //console.log("thumbsVisibleWidth" , thumbsVisibleWidth);
            $scope.showThumbs = false;
        }else{
            //show thumbnails
            //console.log("no scroller, thumbsWidth : " , thumbsWidth, "containerWidth : ", containerWidth);
            thumbsVisibleWidth = thumbsWidth + 10;//plus 10 just in case
            $scope.showThumbs = true;
        }
    }

    /*
    function isTouchDevice() {
        return !!('ontouchstart' in window);
    }*/

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

    $scope.$on("show-projects-selector", function(event){
        $scope.showProjectsList = true;
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
        //$scope.renderNormal();
        //$rootScope.$broadcast("");
    }


    function showProject(){
        var size = getProjectDimensions();
        if(portfolioService.clientHasFlash && $scope.project.swfs && $rootScope.containerRect.width>=size.width){
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
    //==============::IMAGE ROTATOR::=================
    //===========================================

    //TODO : Move to own controller (or directive?)

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

}
