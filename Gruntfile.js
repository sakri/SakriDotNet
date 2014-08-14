/**
 * Created by sakri on 16-12-13.
 */

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //BCHW HOME

        concat: {
            dist: {
                files: {

                    'js/release.js': ["bower_components/angular/angular.js",
                        "bower_components/x2js/xml2json.js",
                        "js/portfolioService.js",
                        "js/analyticsService.js",
                        "js/portfolioController.js",
                        "js/calenderButtonController.js",
                        "js/yearSelectorController.js",
                        "js/contactController.js",
                        "js/sakriDotNet.js"]
                }
            }
        },

        uglify: {

            dist: {
                files: {
                    'js/release.min.js':'js/release.js'
                }
            }
        }

    });


    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat', 'uglify']);

};