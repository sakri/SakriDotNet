/**
 * Created by sakri on 13-8-14.
 */

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
