//=============================================
//==============::CONTROLLERS::================
//=============================================

//MAIN TODO: This is not being used, could this replace "mainDivController" instead?
function mainController($rootScope, $scope, $location, $timeout, analyticsService) {

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

//TODO is it possible to move the controller functionality into this directive? if not, remove these two, not needed
function portfolioCalenderButtonDirective(){
    //console.log("portfolioCalenderButtonDirective");
    return {
        restrict:'A',
        replace:false,
        controller: 'calenderButtonController'
    }
}

function portfolioProjectsButtonDirective(){
    //console.log("portfolioProjectsButtonDirective");
    return {
        restrict:'A',
        replace:false,
        controller: 'projectsButtonController'
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
angular
    .module('sakriDotNet', [])

    //===========
    //SERVICES
    //===========

    .service('portfolioService', ['$http', portfolioService])
    //.service('imageService', [imageService])
    .service('analyticsService', [analyticsService])
    .service('canvasTextService', [canvasTextService])
    .service('colorService', [colorService])

    //==========================
    //CONTROLLERS AND DIRECTIVES
    //==========================

    .controller('mainController', ['$rootScope', '$scope', '$location', '$timeout', 'analyticsService', mainController])

    .controller('mainDivController', ['$rootScope', '$scope', '$location', '$timeout', 'analyticsService', mainDivController])
    .directive('mainDiv', mainDivDirective)

    .controller('portfolioController', ['$rootScope', '$scope', '$location' , '$timeout', 'portfolioService', 'analyticsService', 'colorService', portfolioController])
    .directive('portfolioSection', portfolioDirective)

    .controller('calenderButtonController', ['$rootScope', '$scope', 'portfolioService', 'colorService', 'canvasTextService', calenderButtonController])
    .directive('portfolioCalenderButton', portfolioCalenderButtonDirective)

    .controller('projectsButtonController', ['$rootScope', '$scope', 'colorService', 'canvasTextService', projectsButtonController])
    .directive('portfolioProjectsButton', portfolioProjectsButtonDirective)

    .controller('yearSelectorController', ['$rootScope', '$scope', '$location' , '$timeout', 'colorService', 'portfolioService', 'analyticsService', 'canvasTextService',  yearSelectorController])
    .directive('portfolioYearSelector', yearSelectorDirective)

    .controller('contactController', ['$scope', '$http', 'analyticsService', contactController]);