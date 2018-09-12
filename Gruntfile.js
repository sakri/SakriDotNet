module.exports = function(grunt) {

    grunt.log.write(' --BUILDING : sakri.net');

    //minify css
    //try to set up ftp from grunt
    //metadata can be in one file? Injected by grunt

    var minifyJsFiles = {
        './release/js/SakriDotNet.min.js' : './release/js/SakriDotNetConcat.js',
        './release/js/StatsModule.min.js' : './release/js/StatsModuleConcat.js'
    };
    var concatJSFiles = {
        'release/js/SakriDotNetConcat.js': [
            "./js/utils.js",
            "./js/layout.js",
            "./js/data.js",
            "./js/sprites.js",
            "./js/SakriDotNetLoader.js",
            "./js/CanvasInteractionManager.js",
            "./js/DragManager.js",
            "./js/CardCanvasRenderer.js",
            "./js/CardHtmlRenderer.js",
            "./js/CardsMenu.js",
            "./js/Card.js",
            "./js/EffectsLayer.js",
            "./js/SakriDotNetHomeApp.js"
        ],
        'release/js/StatsModuleConcat.js': [
            "./js/utils.js",
            "./js/layout.js",
            "./js/data.js",
            "./js/sprites.js",
            "./js/StatsModuleSpaghetti.js"
        ]
    };

    var minifyCssFiles = {
        './release/css/SakriDotNet.min.css' : './css/SakriDotNet.css',
        './release/css/StatsModule.min.css' : './css/StatsModuleConcat.js'
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

    //================ SITE SPECIFIC CUSTOM TASKS ==========================

    var embedMinifiedScript = function(sourceHtmlFile, minifiedJSFile, releaseHtmlFile){

        var replaceStartTag = "<!-- javascript sources -->";
        var replaceEndTag = "<!-- init -->";

        if(!sourceHtmlFile || !minifiedJSFile || !releaseHtmlFile){
            grunt.log.writeln("embedMinifiedScript Error : invalid parameter(s)");
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



    var copyToRelease = function(sourceHtmlFile, releaseHtmlFile){
        var sourceContents = grunt.file.read(sourceHtmlFile);
        grunt.file.write(releaseHtmlFile, sourceContents);
    };

    grunt.registerTask('copyToRelease', 'copies index.html as is so source code can be viewed in browsers dev tools', copyToRelease);


    //================ SET DEFAULT TASK ==========================

    grunt.registerTask('default', [
        'concat',
        'uglify',
        'cssmin',
        'embedMinifiedScript:./index.html:./release/js/SakriDotNet.min.js:./release/index.html',
        'embedMinifiedScript:./faq.html:./release/js/SakriDotNet.min.js:./release/faq.html',
        'embedMinifiedScript:./portfolio.html:./release/js/SakriDotNet.min.js:./release/portfolio.html',
        'embedMinifiedScript:./statsModule.html:./release/js/StatsModule.min.js:./release/statsModule.html',
        'embedMinifiedCss:./release/index.html:./release/css/SakriDotNet.min.css',
        'embedMinifiedCss:./release/faq.html:./release/css/SakriDotNet.min.css',
        'embedMinifiedCss:./release/portfolio.html:./release/css/SakriDotNet.min.css',
        'embedMinifiedCss:./release/statsModule.html:./release/css/statsModule.min.css:',
        'copyToRelease:./index.html:./release/indexWithSource.html',
        'copyToRelease:./css/SakriDotNet.css:./release/css/SakriDotNet.css',
        'copyToRelease:./css/StatsModule.css:./release/css/StatsModule.css'
    ]);

};