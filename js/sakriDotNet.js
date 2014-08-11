//=============================================
//================::SERVICES::=================
//=============================================

//GOOGLE ANALYTICS SERVICE
function analyticsService() {

    var isLive = window.location.host.indexOf("sakri.net") > -1;
    //console.log("analyticsService", isLive, _gaq);

    this.logOutBoundClick = function(link){
        var name=String(link).replace(/.*?:\/\//g, "");//from http://stackoverflow.com/questions/8206269/javascript-how-to-remove-http-from-url
        if(name.indexOf("www.")==0){
            name=name.split("www.")[1];
        }
        name=name.split(".")[0];
        if(isLive){
            _gaq.push(["_trackEvent", "outBoundClicks", name]);
        }

        window.open(link,'_blank');

    }

    this.logSectionVisit = function(sectionName){
        if(isLive){
            //console.log("logSectionVisit()", _gaq,  sectionName);
            _gaq.push(["_trackEvent", "Home", sectionName]);
        }
    }

    this.logPortfolioProject = function(projectName){
        if(isLive){
            //console.log("logPortfolioProject()", projectName);
            _gaq.push(["_trackEvent", "Portfolio", projectName]);
        }
    }

    this.logPortfolioYear = function(year){
        if(isLive){
            //console.log("logPortfolioYear()", year);
            _gaq.push(["_trackEvent", "Portfolio", year]);
        }
    }

    this.logContactMessage = function(){
        if(isLive){
            //console.log("logPortfolioYear()", year);
            _gaq.push(["_trackEvent", "ContactMailSent"]);
        }
    }

    this.logPreviousProjectClick = function(){
        if(isLive){
            _gaq.push(["_trackEvent", "previousProject"]);
        }
    }

    this.logNextProjectClick = function(){
        if(isLive){
            _gaq.push(["_trackEvent", "nextProject"]);
        }
    }

}



//TODO rename to xml service or so?
//from http://rabidgadfly.com/2013/02/angular-and-xml-no-problem/
function portfolioService($http) {

    this.clientHasFlash  = false;

    //http://stackoverflow.com/questions/998245/how-can-i-detect-if-flash-is-installed-and-if-not-display-a-hidden-div-that-inf
    try {
        var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        if (fo) {
            this.clientHasFlash = true;
        }
    } catch (e) {
        if (navigator.mimeTypes
            && navigator.mimeTypes['application/x-shockwave-flash'] != undefined
            && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
            this.clientHasFlash = true;
        }
    }

    var json = createPortfolioJson();
    //console.log("temp : ", json);
    var availableYears = getAvailableYears();

    function createPortfolioJson(){
        var xmlNode = document.getElementById("portfolioXml");
        var xml = xmlNode.innerHTML;
        xmlNode.innerHTML = "";
        var x2js = new X2JS();
        var json = x2js.xml_str2json( xml );
        var last = json.portfolio.project[json.portfolio.project.length-1];
        last.description = last.description.split("[numProjects]").join(""+json.portfolio.project.length);
        return json;
    }

    function getAvailableYears(){
        var unique = {};
        var projects = json.portfolio.project;
        var years = [];
        for(var i=0; i<projects.length; i++){
            if(!unique[projects[i].year]){
                years.push(projects[i].year);
                unique[projects[i].year] = true;
            }
        }
        //console.log(years);//TODO : sort
        return years;
    }

    this.yearHasProjects = function(year){
        return availableYears.indexOf(String(year)) > -1;
    }

    this.getAvailableYears = function(){
        return availableYears;//should make a copy instead of returning original
    }

    this.getJson = function(){
        return json;
    }

    this.getProjectsForYear = function(year){
        var allProjects = json.portfolio.project;
        var projects = [];
        for(var i=0; i<allProjects.length; i++){
            if(allProjects[i].year == year){
                projects.push(allProjects[i]);
            }
        }
        return projects;
    }

    this.getProjectIndex = function(project){
        return json.portfolio.project.indexOf(project);
    }

    this.isFirstProject = function(project){
        return this.getProjectIndex(project) == 0;
    }

    this.isLastProject = function(project){
        return this.getProjectIndex(project) == json.portfolio.project.length-1;
    }

    this.getPreviousProject = function(project){
        if(this.isFirstProject(project)){
            return undefined;
        }
        return json.portfolio.project[this.getProjectIndex(project) - 1];
    }

    this.getNextProject = function(project){
        if(this.isLastProject(project)){
            return undefined;
        }
        return json.portfolio.project[this.getProjectIndex(project) + 1];
    }

}


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


//CONTACT
function contactController($rootScope, $scope, $http, analyticsService) {

    $scope.mailSent = false;
    $scope.sender = "";
    $scope.message = "Hi Sakri,";

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function showEmailErrorMessage(message){
        alert(message);//yes yes, not the most creative solution
    }

    $scope.submitForm = function() {
        //console.log("posting data....", JSON.stringify($scope.data));
        if(!validateEmail($scope.sender)){
            showEmailErrorMessage("Your email doesn't seem to be valid, double check?");
            return;
        }
        if($scope.message=="Hi Sakri," || $scope.message==""){
            showEmailErrorMessage("Would be nice if you actually left a message...");
            return;
        }
        var sender =  encodeURIComponent($scope.sender);
        var message = encodeURIComponent($scope.message);
        var params = "sender="+sender+"&message="+message;
        $http.defaults.headers.post = { 'Content-Type' : "application/x-www-form-urlencoded" };
        $http.post('http://www.sakri.net/sendMail.php', params).success(successHandler).error(errorHandler);
        analyticsService.logContactMessage();
    };

    function successHandler(data, status){
        //console.log("email success!");
        $scope.message = "Hi Sakri,";
        $scope.mailSent = true;
    }

    function errorHandler(data, status){
        console.log("not sure why, but I always get an error!");
        $scope.message = "Hi Sakri,";
        $scope.mailSent = true;
    }

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

function contactDirective(){
    return {
        restrict:'A',
        replace:false,
        controller: 'contactController'
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
app.controller('portfolioController', ['$rootScope', '$scope', '$location' , '$timeout', 'portfolioService', 'analyticsService', 'colorService', portfolioController]);
app.directive('portfolioSection', portfolioDirective);

//YEAR SELECTOR
app.controller('yearSelectorController', ['$rootScope', '$scope', '$location' , '$timeout', 'colorService', 'portfolioService', 'analyticsService', yearSelectorController]);
app.directive('portfolioYearSelector', yearSelectorDirective);

//Contact
app.controller('contactController', ['$rootScope', '$scope', '$http', 'analyticsService', contactController]);
app.directive('contactSection', contactDirective);