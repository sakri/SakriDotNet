/**
 * Created by sakri on 12-8-14.
 */

function portfolioService($http) {

    this.currentProject = 0;//TODO: move elsewhere, create a service or constant or variable or whatever

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
