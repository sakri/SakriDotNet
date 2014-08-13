//=============================================
//================::SERVICES::=================
//=============================================

//a bit pointless for now, is foreseen to provide more of a service
function colorService(){
    this.headerColor = "#f25a2b";
    this.subHeaderColor = "#bcc0d2";
    this.bgColor = "#edd8aa";
    this.white = "#FFFFFF";
    this.gray = "#888888";
}


//=============================================
//==============::CONTROLLERS::================
//=============================================

//MAIN
function mainController($rootScope, $scope, $location, $timeout, analyticsService) {


}

//MAIN DIV
function mainDivController($rootScope, $scope, $location, $timeout, analyticsService){

    var container, resizeTimeoutPromise;

    var headerImages = {"home":"home", "portfolio":"work", "cv":"about", "contact":"contact"};

    $scope.currentSection = "home";
    $scope.showSocialMediaBar = true;

    function setHeaderImage(){
        $scope.headerImage = "assets/headers/"+headerImages[$scope.currentSection]+".gif"
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
    }

    $scope.outboundLinkClick = function(url){
        analyticsService.logOutBoundClick(url);
    }

    resizeHandler();

}


//=============================================
//==============::DIRECTIVES::=================
//=============================================

function mainDivDirective(){
    return {
        restrict:'A',
        replace:false,
        controller: 'mainDivController',
        link: function(scope, element, attributes, controller) {
            controller.initialize(element);
        }
    }
}

function portfolioDirective(){
    return {
        restrict:'A',
        replace:false,
        controller: 'portfolioController'
    }
}

function yearSelectorDirective(){
    return {
        restrict:'A',
        replace:false,
        controller: 'yearSelectorController',
        link: function(scope, element, attributes, controller) {
            controller.initialize(element);
        }
    }
}

//===========
//APP
//===========
var app = angular.module('sakriDotNet', []);

//===========
//SERVICES
//===========

//PORTFOLIO SERVICE
app.service('portfolioService', ['$http', portfolioService]);

//IMAGE SERVICE
//app.service('imageService', [imageService]);

//GOOGLE ANALYTICS SERVICE
app.service('analyticsService', [analyticsService]);

//CANVAS TEXT SERVICE
app.service('canvasTextService', [canvasTextService]);

//COLOR SERVICE
app.service('colorService', [colorService]);


//===========
//CONTROLLERS
//===========

//MAIN CONTROLLER
app.controller('mainController', ['$rootScope', '$scope', '$location', '$timeout', 'analyticsService', mainController]);

//MAIN DIV CONTROLLER
app.controller('mainDivController', ['$rootScope', '$scope', '$location', '$timeout', 'analyticsService', mainDivController]);
app.directive('mainDiv', mainDivDirective);

//PORTFOLIO
app.controller('portfolioController', ['$rootScope', '$scope', '$location' , '$timeout', 'portfolioService', 'analyticsService', 'colorService', 'canvasTextService', portfolioController]);
app.directive('portfolioSection', portfolioDirective);

//YEAR SELECTOR
app.controller('yearSelectorController', ['$rootScope', '$scope', '$location' , '$timeout', 'colorService', 'portfolioService', 'analyticsService', 'canvasTextService',  yearSelectorController]);
app.directive('portfolioYearSelector', yearSelectorDirective);

//Contact
app.controller('contactController', ['$scope', '$http', 'analyticsService', contactController]);