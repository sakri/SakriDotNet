/**
 * Created by sakri on 16-8-14.
 */

function mainDivController($rootScope, $scope, $location, $timeout, analyticsService){

    var container, resizeTimeoutPromise;

    var headerImages = {"home":"home", "portfolio":"work", "cv":"about", "contact":"contact"};

    $scope.currentSection = "home";
    $scope.showSocialMediaBar = true;

    function setHeaderImage(){
        $scope.headerImage = "assets/headers/"+headerImages[$scope.currentSection]+".gif";
    }

    function init(){
        $scope.currentSection = isValidSection() ? getSection() : "home";
        $rootScope.$broadcast("navigate", $scope.currentSection);
        showFooter();
        $rootScope.$on('$locationChangeSuccess', function () {
            $scope.currentSection = getSection();
            analyticsService.logSectionVisit($scope.currentSection);
            showFooter();
            setHeaderImage();
        });
        setHeaderImage();
    }

    function showFooter(){
        $scope.showSocialMediaBar = $scope.currentSection != "portfolio";
    }

    function isValidSection(){
        return headerImages[getSection()] != undefined;
    }

    function getSection(){
        return $location.path().split("/")[1];
    }

    //avoid running resize scripts repeatedly if a browser window is being resized by dragging
    function resizeHandler(){
        if (resizeTimeoutPromise) {
            $timeout.cancel(resizeTimeoutPromise);
        }else{
            $rootScope.$broadcast("resize-start");
        }
        resizeTimeoutPromise = $timeout(commitResize, 300 );
    }

    function commitResize(){
        resizeTimeoutPromise = undefined;
        updateContainerRect();
        $rootScope.$broadcast("commit-resize",  $rootScope.containerRect);
    }

    function updateContainerRect(){
        $rootScope.containerRect = container.getBoundingClientRect();
        $rootScope.containerRect.width -= 6;//-6 for 3px border, TODO make dynamic, take into account different box models?
    }

    this.initialize = function(element) {
        container = element[0];
        window.addEventListener('resize', resizeHandler);
        updateContainerRect();
        $timeout(init, 200);
    };

    $scope.outboundLinkClick = function(url){
        analyticsService.logOutBoundClick(url);
    };

    resizeHandler();

}
