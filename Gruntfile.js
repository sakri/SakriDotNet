module.exports = function(grunt) {

    grunt.log.write(' --BUILDING : sakri.net');

    //TODO: script should read the html page, grab js/css files then min/concat, instead of maintaining the list twice!
    var minifyJsFiles = {
        './release/js/SakriDotNet.min.js' : './release/js/SakriDotNetConcat.js',
        './release/js/StatsModule.min.js' : './release/js/StatsModuleConcat.js'
    };

    //TODO: these should be read/parsed from the html pages <script> tags instead of manual updates!
    var concatJSFiles = {
        /* app */
        'release/js/SakriDotNetConcat.js': [
            "./js/utils.js",
            "./js/layout/SakriDotNetLayout.js",
            "./js/layout/SakriDotNetTransitions.js",
            "./js/TangleUI/TangleUI.js",
            "./js/TangleUI/Transition.js",
            "./js/TangleUI/Animation.js",
            "./js/layout/AppLayout.js",
            "./js/service/HomeSectionsDataParser.js",
            "./js/service/GoogleAnalytics.js",
            "./js/data.js",
            "./js/sprites.js",
            "./js/widget/LoaderCircles.js",
            "./js/SakriDotNetLoader.js",
            "./js/CanvasInteractionManager.js",
            "./js/DragManager.js",
            "./js/widget/TabButton.js",
            "./js/CardCanvasRenderer.js",
            "./js/CardHtmlRenderer.js",
            "./js/CardsMenu.js",
            "./js/widget/DonutChart.js",
            "./js/widget/SpeechBubble.js",
            "./js/Card.js",
            "./js/widget/ToStatsButtonBackground.js",
            "./js/MenuButton.js",
            "./js/StatsModuleLoader.js",
            "./js/SakriDotNetHomeApp.js"
        ],
        /* stats view app */
        'release/js/StatsModuleConcat.js': [
            "./js/utils.js",
            "./js/TangleUI/TangleUI.js",
            "./js/TangleUI/Transition.js",
            "./js/TangleUI/Animation.js",
            "./js/statsModule/StatsModuleTangleUIRects.js",
            "./js/statsModule/StatsModuleTangleUITransitions.js",
            "./js/data.js",
            "./js/widget/LineChart.js",
            "./js/widget/PieChart.js",
            "./js/widget/ProgressBarList.js",
            "./js/widget/TabButton.js",
            "./js/widget/PixelConfetti.js",
            "./js/widget/CelebrationsAnimation.js",
            "./js/sprites.js",
            "./js/external/textFit.js",
            "./js/statsModule/statsModule.js"
        ]
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
     */

    //================ SITE SPECIFIC CUSTOM TASKS ==========================

    var prepareRelease = function(){
        if(grunt.file.exists("./release")){
            grunt.file.delete("./release");
        }
        grunt.file.mkdir("./release");
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
        'copyToRelease:./css/statsModule.css:./release/css/statsModule.css'
    ]);

};