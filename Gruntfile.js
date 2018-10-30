module.exports = function(grunt) {

    grunt.log.write(' --BUILDING : sakri.net');

    var getAppJSFilePaths = function(sourceHtmlFile){
        var replaceStartTag = "<!-- javascript sources -->";
        var replaceEndTag = "<!-- init -->";

        if(!sourceHtmlFile){
            grunt.log.writeln("getHomeJSFiles() Error : invalid parameter sourceHtmlFile : " +  sourceHtmlFile);
            return;
        }

        var sourceContents = grunt.file.read(sourceHtmlFile);
        var parts = sourceContents.split(replaceStartTag);
        var scriptsString = parts[1].split(replaceEndTag)[0];
        var scriptTags = scriptsString.split("<script src=\"");
        var scriptPaths = [];
        for(var i = 0; i< scriptTags.length; i++){
            scriptPaths[i] = scriptTags[i].split("\"></script>")[0];
        }
        return scriptPaths;
    };

    var minifyJsFiles = {
        './release/js/SakriDotNet.min.js' : './release/js/SakriDotNetConcat.js',
        './release/js/StatsModule.min.js' : './release/js/StatsModuleConcat.js'
    };

    var concatJSFiles = {
        'release/js/SakriDotNetConcat.js' : getAppJSFilePaths("index.html"),
        'release/js/StatsModuleConcat.js' : getAppJSFilePaths("statsModule.html")
    };

    var minifyCssFiles = {
        './release/css/sakriDotNet.min.css' : './css/sakriDotNet.css',
        './release/css/statsModule.min.css' : './css/statsModule.css'
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                files: concatJSFiles
            }
        },

        uglify: {
            dist: {
                files: minifyJsFiles
            }
        },

        cssmin: {
            dist: {
                files: minifyCssFiles
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.loadNpmTasks('grunt-contrib-copy');

    /*
npm install -g grunt-cli
npm install grunt-contrib-copy --save-dev
npm install grunt-contrib-concat --save-dev
npm install grunt-contrib-cssmin --save-dev
npm install grunt-contrib-uglify --save-dev
npm install libxmljs --save-dev
     */

    //================ SITE SPECIFIC CUSTOM TASKS ==========================

    var prepareRelease = function(){
        if(grunt.file.exists("./release")){
            grunt.file.delete("./release");
        }
        grunt.file.mkdir("./release");
        grunt.file.mkdir("./release/faq");
        grunt.file.mkdir("./release/portfolio");
        grunt.file.copy("./css/", "./release/css/");
        grunt.file.copy("./js/", "./release/js/");
    };
    grunt.registerTask('prepareRelease', 'deletes/creates release folder', prepareRelease);

    var copyToRelease = function(sourceHtmlFile, releaseHtmlFile){
        var sourceContents = grunt.file.read(sourceHtmlFile);
        grunt.file.write(releaseHtmlFile, sourceContents);
    };

    grunt.registerTask('copyToRelease', 'copies index.html as is so source code can be viewed in browsers dev tools', copyToRelease);

    var embedMinifiedScript = function(sourceHtmlFile, minifiedJSFile, releaseHtmlFile){

        var replaceStartTag = "<!-- javascript sources -->";
        var replaceEndTag = "<!-- init -->";

        if(!sourceHtmlFile || !minifiedJSFile || !releaseHtmlFile){
            grunt.log.writeln("embedMinifiedScript Error : invalid parameter(s)");
            return;
        }

        var sourceContents = grunt.file.read(sourceHtmlFile);
        var minifiedCode = grunt.file.read(minifiedJSFile);
        var parts = sourceContents.split(replaceStartTag);
        var topBun = parts[0];
        var bottomBun = parts[1].split(replaceEndTag)[1];
        var contents = topBun + replaceStartTag + "\n\t<script>" + minifiedCode + "</script>\n\n\t" + replaceEndTag + "\n" + bottomBun;
        grunt.file.write(releaseHtmlFile, contents);
    };

    grunt.registerTask('embedMinifiedScript', 'Inserts or replaces minified script in a file', embedMinifiedScript);


    var embedMinifiedCss = function(htmlFile, minifiedCssFile){

        var replaceStartTag = "<!-- CSS -->";
        var replaceEndTag = "<!-- javascript sources -->";

        if(!htmlFile || !minifiedCssFile){
            grunt.log.writeln("embedMinifiedCss Error : invalid parameter(s)");
            return;
        }

        var sourceContents = grunt.file.read(htmlFile);
        var minifiedCss = grunt.file.read(minifiedCssFile);
        var parts = sourceContents.split(replaceStartTag);
        var topBun = parts[0];
        var bottomBun = parts[1].split(replaceEndTag)[1];
        var contents = topBun + replaceStartTag + "\n\t<style>" + minifiedCss + "</style>\n\n\t" + replaceEndTag + bottomBun;
        grunt.file.write(htmlFile, contents);
    };

    grunt.registerTask('embedMinifiedCss', 'Inserts or replaces minified css in a file', embedMinifiedCss);



    var getHtmlPathsFromSiteMap = function(xmlString, excludedFiles, prependPath){
        prependPath = prependPath || "";
        var paths = [];
        var urls = xmlString.split("<url>"), i, url;
        //grunt.log.writeln("getHtmlPathsFromSiteMap() urls.length : " + urls.length);
        for(i=1; i<urls.length; i++){
            url = urls[i].split("<loc>")[1];
            url = url.split("</loc>")[0];
            url = url.split("/");
            url = url[url.length - 1];
            if(!excludedFiles || excludedFiles.indexOf(url)==-1){
                paths.push(prependPath + url);
            }
        }
        return paths;
    };

    var createNavigationString = function(path, urls){
        var nav = '\n\t<nav>';
        nav += '\n\t\t<a href="https://www.sakri.net/index.html">home</a>';
        nav += '\n\t\t<a href="https://www.sakri.net/portfolio.html">portfolio</a>';
        nav += '\n\t\t<a href="https://www.sakri.net/faq.html">faq</a>';
        var i, link;
        for(i=0; i<urls.length; i++){
            link = urls[i].split(".")[0];
            if(link.indexOf("_") > -1){
                link = link.split("_").join(" ");
            }
            nav += '\n\t\t<a href="' + path + urls[i] + '">' + link + '</a>';
        }
        nav += '\n\t</nav>\n';
        return nav;
    };

    var getGeneratedFilesHead = function(headTemplatePath){
        var head = grunt.file.read(headTemplatePath);
        head = head.split("<head>")[1];
        return head.split("</head>")[0];
    };

    var setGeneratedFileMetaData = function(file, templateString){
        var title = file.split("<title>")[1].split("</title>")[0];
        templateString = templateString.split("<title></title>").join("<title>" + title + "</title>");
        return file.split("<head>")[0] + templateString + file.split("</head>")[1];
    };

    var generateFilesFromSitemap = function(path, excludedFiles){
        grunt.log.writeln("generateFilesFromSitemap() path: " + path );
        var siteMap = grunt.file.read("./" + path + "sitemap.xml");
        grunt.file.write("./release/" + path + "sitemap.xml", siteMap);
        var urls = getHtmlPathsFromSiteMap(siteMap, excludedFiles);
        var nav = createNavigationString("./", urls);
        var metadata = getGeneratedFilesHead("./assets/metadata.html");
        var i, file;
        for(var i=0; i<urls.length; i++){
            file = grunt.file.read("./" + path + urls[i]);
            file = file.split("<body>").join("<body>" + nav);
            file = setGeneratedFileMetaData(file, metadata);
            grunt.file.write("./release/" + path + urls[i], file);
        }
    };

    //was gonna npm install libxmljs --save-dev, but sitemap parsing is very simple

    //needs to be done for home files, faq and portfolio
    var generateHtmlFiles = function(){
        var sitemapIndex = grunt.file.read("./sitemap_index.xml");
        grunt.file.write("./release/sitemap_index.xml", sitemapIndex);
        generateFilesFromSitemap("", ["faq.html", "index.html", "portfolio.html"]);
        generateFilesFromSitemap("faq/");
        generateFilesFromSitemap("portfolio/");
    };

    grunt.registerTask('generateHtmlFiles', 'generates static html content files', generateHtmlFiles);



    var getBodyAnchorNameFromFile = function(fileName){
        if(fileName.indexOf("/index.html") > -1){
            return fileName.split("/")[0];
        }
        if(fileName.indexOf("/") > -1){
            fileName = fileName.split("/")[1];
        }
        return fileName.split(".html")[0];
    };

    var updateAppContents = function(appFileName, files, title, siteLinks){
        grunt.log.writeln("updateAppContents() file: " + appFileName );
        var appFile = grunt.file.read("./release/" + appFileName);
        var i, filePath, fileContents, bodyAnchor,
            bodyContent = "\n\t<h1>" + title + "</h1>\n",
            nav = "\n\t<nav>", siteLink;
        if(siteLinks){
            for(i=0; i<siteLinks.length; i++){
                siteLink = siteLinks[i];
                nav += '\n\t\t<a href="https://www.sakri.net/' + siteLink.link + '">' + siteLink.title + '</a>';
            }
        }
        for(i=0; i<files.length; i++){
            filePath = files[i];
            bodyAnchor = getBodyAnchorNameFromFile(filePath);
            nav += '\n\t\t<a href="#' + bodyAnchor + '">' + bodyAnchor.split("_").join(" ") + '</a>';
            bodyContent += '\n\t<section id="' + bodyAnchor + '">\n';
            fileContents = grunt.file.read(filePath);
            bodyContent += fileContents.split("<body>")[1].split("</body>")[0];
            bodyContent += '\n\t</section>\n';
        }
        nav += "\n\t</nav>\n";
        bodyContent = nav + bodyContent;
        var topBun = appFile.split("<body>")[0] + "<body>";
        var bottomBun = "</body>" + appFile.split("</body>")[1];
        grunt.file.write("./release/" + appFileName, topBun + bodyContent + bottomBun);
    };

    //needs to be done for home files, faq and portfolio
    var updateAppsContents = function(){
        var files = ["about.html", "services.html", "portfolio/index.html", "contact.html", "faq/index.html", "workshops.html"]
        updateAppContents("index.html", files, "Sakri Rosenstrom");
        updateAppContents("indexWithSource.html", files, "Sakri Rosenstrom");
        files = getHtmlPathsFromSiteMap(grunt.file.read("./faq/sitemap.xml"), null, "faq/");
        files.shift();//remove index (could be better)
        updateAppContents("faq.html", files, "Frequently Asked Questions", [{title:"home", link:"index.html"}, {title:"portfolio", link:"portfolio.html"}]);
        files = getHtmlPathsFromSiteMap(grunt.file.read("./portfolio/sitemap.xml"), null, "portfolio/");
        files.shift();//remove index (could be better)
        updateAppContents("portfolio.html", files, "Portfolio", [{title:"home", link:"index.html"}, {title:"faq", link:"faq.html"}]);
    };

    grunt.registerTask('updateAppsContents', 'update apps contents static html content files', updateAppsContents);


    //================ SET DEFAULT TASK ==========================

    grunt.registerTask('default', [
        'prepareRelease',
        'concat',
        'uglify',
        'cssmin',

        'embedMinifiedScript:./index.html:./release/js/SakriDotNet.min.js:./release/index.html',
        'embedMinifiedScript:./faq.html:./release/js/SakriDotNet.min.js:./release/faq.html',
        'embedMinifiedScript:./portfolio.html:./release/js/SakriDotNet.min.js:./release/portfolio.html',
        'embedMinifiedScript:./statsModule.html:./release/js/StatsModule.min.js:./release/statsModule.html',

        'embedMinifiedCss:./release/index.html:./release/css/sakriDotNet.min.css',
        'embedMinifiedCss:./release/faq.html:./release/css/sakriDotNet.min.css',
        'embedMinifiedCss:./release/portfolio.html:./release/css/sakriDotNet.min.css',
        'embedMinifiedCss:./release/statsModule.html:./release/css/statsModule.min.css',

        'copyToRelease:./index.html:./release/indexWithSource.html',
        'copyToRelease:./css/sakriDotNet.css:./release/css/sakriDotNet.css',
        'copyToRelease:./css/statsModule.css:./release/css/statsModule.css',

        'generateHtmlFiles:null',
        'updateAppsContents:null'
    ]);

};