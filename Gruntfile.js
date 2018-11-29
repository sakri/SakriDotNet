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

    //================ UTIL FUNCTIONS (TODO: move to GruntUtils.js or so) ====================

    //only works when one tag is present in html file (I know, should parse xml and query, todo)
    //expects a string like : body, nav, footer....
    var extractTagAndContentsFromHtml = function(html, tag){
        var extracted = html.split("<" + tag)[1];
        extracted = html.split("</" + tag + ">")[0];
        return "<" + tag + extracted + "</" + tag + ">";
    };

    //================ SITE SPECIFIC CUSTOM TASKS ==========================

    var prepareRelease = function(){
        if(grunt.file.exists("./release")){
            grunt.file.delete("./release");
        }
        grunt.file.mkdir("./release");
        grunt.file.mkdir("./release/blog");
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


    //prependPath is "faq/" or "blog/" etc.
    //returns {fileName : prependPath + somePage.html, pubDate: 2018-10-31}
    var getFilesFromSiteMap = function(xmlString, excludedFiles, prependPath){
        prependPath = prependPath || "";
        var files = [];
        var urls = xmlString.split("<url>"),
            i, fileName, pubDate;
        grunt.log.writeln("getFilesFromSiteMap() urls.length : " + urls.length);
        for(i=1; i<urls.length; i++){
            fileName = urls[i].split("<loc>")[1];
            fileName = fileName.split("</loc>")[0];
            fileName = fileName.split("/");
            fileName = fileName[fileName.length - 1];
            pubDate = urls[i].split("<lastmod>")[1].split("</lastmod>")[0];
            if(!excludedFiles || excludedFiles.indexOf(fileName) == -1){
                files.push({fileName : prependPath + fileName, pubDate : pubDate});
            }
        }
        return files;
    };

    var createNavigationString = function(files){
        var nav = '\t\t<a href="https://www.sakri.net/index.html">home</a>';
        nav += '\n\t\t<a href="https://www.sakri.net/portfolio.html">portfolio</a>';
        nav += '\n\t\t<a href="https://www.sakri.net/faq.html">faq</a>';
        var i, file, linkTitle;
        for(i=0; i < files.length; i++){
            file = files[i];
            linkTitle = file.fileName.split(".")[0];
            if(linkTitle.indexOf("_") > -1){
                linkTitle = linkTitle.split("_").join(" ");
            }
            nav += '\n\t\t<a href="https://www.sakri.net/' + file.fileName + '">' + linkTitle + '</a>';
        }
        return nav;
    };

    var getGeneratedFilesHeaderString = function(title, pubDate, lastUpdate){
        var header = "<h1>" + title + "</h1>\n\t\t<p>Posted by: Sakri Rosenstrom</p>";
        header += '\n\t\t<p>Last updated on <time datetime="' + pubDate + '">' + pubDate + '</time></p>';
        return header;
    };

    //very clunky, must match createGeneratedFileFromTemplate to the dot
    var getGeneratedFilesTemplateObject = function(){
        var file = grunt.file.read("./templates/pagesTemplate.html");
        var template = {
            slots : ["pageTitle", "pageOgTitle", "pageOgUrl", "pageTwitterTitle", "pageTwitterUrl", "pageHeader", "pageNav", "pageContent"],
            parts:[]
        };

        var slots = template.slots.slice(), parts;//copy
        while(slots.length){
            parts = file.split("{" + slots.pop() + "}");
            template.parts.unshift(parts[1]);
            file = parts[0];
        }
        template.parts.unshift(file);

        return template;
    };

    var getGeneratedPageTemplateData = function(file, template, nav){
        var sourceFile = grunt.file.read("./" + file.fileName);
        var title = sourceFile.split("<title>")[1].split("</title>")[0];
        var url = "https://www.sakri.net/" + file.fileName;
        return {
            "pageTitle" : title,
            "pageOgTitle" : title,
            "pageOgUrl" : url,
            "pageTwitterTitle" : title,
            "pageTwitterUrl" : url,
            "pageHeader" : getGeneratedFilesHeaderString(title, file.pubDate),
            "pageNav" : nav,
            "pageContent" : sourceFile.split("<body>")[1].split("</body>")[0]
        };
    };

    //TODO: add description metadata, find a real template solution
    var createGeneratedFileFromTemplate = function(file, template, nav){
        var data = getGeneratedPageTemplateData(file, template, nav);
        var output = template.parts[0];
        for(var i=0; i<template.slots.length; i++){
            output += (data[template.slots[i]] + template.parts[i + 1]);
        }
        return output;
    };

    var generateFilesFromSitemap = function(path, excludedFiles){

        //read and copy sitemap to release folder
        grunt.log.writeln("generateFilesFromSitemap() path: " + path );
        var siteMap = grunt.file.read("./" + path + "sitemap.xml");
        grunt.file.write("./release/" + path + "sitemap.xml", siteMap);
        var files = getFilesFromSiteMap(siteMap, excludedFiles, path);
        var nav = createNavigationString(files);
        var template= getGeneratedFilesTemplateObject();
        var i, file, html;
        for(i=0; i<files.length; i++){
            file = files[i];
            html = createGeneratedFileFromTemplate(file, template, nav);
            grunt.file.write("./release/" + file.fileName, html);
        }
    };

    //was gonna npm install libxmljs --save-dev, but sitemap parsing is very simple

    //needs to be done for home files, faq and portfolio
    var generateHtmlFiles = function(){
        var sitemapIndex = grunt.file.read("./sitemap_index.xml");
        grunt.file.write("./release/sitemap_index.xml", sitemapIndex);
        generateFilesFromSitemap("", ["faq.html", "index.html", "portfolio.html", "blog.html"]);
        generateFilesFromSitemap("blog/");
        generateFilesFromSitemap("faq/");
        generateFilesFromSitemap("portfolio/");
    };

    grunt.registerTask('generateHtmlFiles', 'generates static html content files', generateHtmlFiles);





    var getSectionHashFromFileName = function(fileName){
        grunt.log.writeln("getSectionHashFromFileName() " + fileName);
        if(fileName.indexOf("/index.html") > -1){
            return fileName.split("/")[0];
        }
        if(fileName.indexOf("/") > -1){
            fileName = fileName.split("/")[1];
        }
        return fileName.split(".html")[0];
    };

    var updateAppContents = function(appFileName, files, title, siteLinks){
        grunt.log.writeln("updateAppContents() file: " + appFileName + ", files.length : " + files.length);
        var appFile = grunt.file.read("./release/" + appFileName);
        var i, filePath, fileContents, hash,
            bodyContent = "\n\t<h1>" + title + "</h1>\n",
            nav = "\n\t<nav>", siteLink, file;
        if(siteLinks){
            for(i=0; i<siteLinks.length; i++){
                siteLink = siteLinks[i];
                nav += '\n\t\t<a href="https://www.sakri.net/' + siteLink.link + '">' + siteLink.title + '</a>';
            }
        }
        for(i=0; i<files.length; i++){
            file = files[i];
            hash = getSectionHashFromFileName(file.fileName);
            nav += '\n\t\t<a href="#' + hash + '">' + hash.split("_").join(" ") + '</a>';
            bodyContent += '\n\t<section id="' + hash + '">\n';
            fileContents = grunt.file.read("./" + file.fileName);
            //
            fileContents = fileContents.split("<body>")[1].split("</body>")[0];
            fileContents = fileContents.split('<img src="https://www.sakri.net/').join('<img src="./');

            bodyContent += fileContents;

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
        //home
        var files = [{fileName : "about.html"}, {fileName : "services.html"}, {fileName : "portfolio/index.html"}, {fileName : "contact.html"}, {fileName : "blog/index.html"}, {fileName : "faq/index.html"}, {fileName : "workshops.html"}]
        updateAppContents("index.html", files, "Sakri Rosenstrom");
        updateAppContents("indexWithSource.html", files, "Sakri Rosenstrom");

        //blog
        files = getFilesFromSiteMap(grunt.file.read("./blog/sitemap.xml"), null, "blog/");
        files.shift();//remove index (could be better)
        updateAppContents("blog.html", files, "Blog", [{title:"home", link:"index.html"}, {title:"portfolio", link:"portfolio.html"}, {title:"faq", link:"faq.html"}]);

        //faq
        files = getFilesFromSiteMap(grunt.file.read("./faq/sitemap.xml"), null, "faq/");
        files.shift();//remove index (could be better)
        updateAppContents("faq.html", files, "Frequently Asked Questions", [{title:"home", link:"index.html"}, {title:"portfolio", link:"portfolio.html"}, {title:"blog", link:"blog.html"}]);

        //portfolio
        files = getFilesFromSiteMap(grunt.file.read("./portfolio/sitemap.xml"), null, "portfolio/");
        files.shift();//remove index (could be better)
        updateAppContents("portfolio.html", files, "Portfolio", [{title:"home", link:"index.html"}, {title:"faq", link:"faq.html"}, {title:"blog", link:"blog.html"}]);
    };

    grunt.registerTask('updateAppsContents', 'update apps contents static html content files', updateAppsContents);


    //================ SET DEFAULT TASK ==========================

    grunt.registerTask('default', [
        'prepareRelease',
        'concat',
        'uglify',
        'cssmin',

        'embedMinifiedScript:./index.html:./release/js/SakriDotNet.min.js:./release/index.html',
        'embedMinifiedScript:./blog.html:./release/js/SakriDotNet.min.js:./release/blog.html',
        'embedMinifiedScript:./faq.html:./release/js/SakriDotNet.min.js:./release/faq.html',
        'embedMinifiedScript:./portfolio.html:./release/js/SakriDotNet.min.js:./release/portfolio.html',
        'embedMinifiedScript:./statsModule.html:./release/js/StatsModule.min.js:./release/statsModule.html',

        'embedMinifiedCss:./release/index.html:./release/css/sakriDotNet.min.css',
        'embedMinifiedCss:./release/blog.html:./release/css/sakriDotNet.min.css',
        'embedMinifiedCss:./release/faq.html:./release/css/sakriDotNet.min.css',
        'embedMinifiedCss:./release/portfolio.html:./release/css/sakriDotNet.min.css',
        'embedMinifiedCss:./release/statsModule.html:./release/css/statsModule.min.css',

        'copyToRelease:./index.html:./release/indexWithSource.html',
        'copyToRelease:./404.html:./release/404.html',
        'copyToRelease:./css/sakriDotNet.css:./release/css/sakriDotNet.css',
        'copyToRelease:./css/statsModule.css:./release/css/statsModule.css',

        'generateHtmlFiles:null',
        'updateAppsContents:null'
    ]);

};