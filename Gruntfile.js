/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-config');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-html-build');
    grunt.loadNpmTasks('grunt-bake');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.initConfig({
        config: {
            dev: {
                options: {
                    variables: {
                        'dest': 'dev/'
                    }
                }
            },
            release: {
                options: {
                    variables: {
                        'dest': 'dist/'
                    }
                }
            }
        },
        bake: {
            main: {
                options: {
                    // Task-specific options go here.
                },

                files: {
                    "dist/index.html": "src/index.html",
                }
            },
        },
        htmlbuild: {
            main: {
                src: [
                    'src/**/*.html',
                    '!src/layout/**',
                    '!src/views/**',
                    '!src/css/fonts/**'
                ],
                dest: '<%= grunt.config.get("dest") %>',
                options: {
                    beautify: true,
                    processFiles: true,
                    relative: false,
                    scripts: {
                        main: {
                            cwd: 'src/',
                            files: ['scripts/main.js']
                        },
                        jquery: {
                            files: [
                                'https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js',
                                'https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js',
                            ]
                        },
                        layout: {
                            cwd: 'src/',
                            files: [
                                'https://code.getmdl.io/1.3.0/material.min.js',
                                'scripts/utils.js',
                                'scripts/nav-helper.js',
                                'scripts/menu-nav.js'
                            ]
                        },
                        wvw_map: {
                            cwd: 'src/',
                            files: [
                                'https://unpkg.com/leaflet@1.0.3/dist/leaflet.js',
                                'https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-image/v0.0.4/leaflet-image.js',
                                'scripts/wvw-map.js',
                                'scripts/matchup-fetcher.js',
                                'scripts/lib/Chart.min.js',
                                'scripts/widget-manager.js'
                            ]
                        }
                    },

                    styles: {
                        bundle: {
                            cwd: 'src/',
                            files: [
                                'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
                                'https://fonts.googleapis.com/icon?family=Material+Icons',
                                'https://code.getmdl.io/1.3.0/material.blue-indigo.min.css',
                                'css/menu-nav.css',
                                'css/style.css'
                            ]
                        },
                        jqueryui: {
                            cwd: 'src/',
                            files: ['https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css']
                        },
                        leaflet: {
                            cwd: 'src/',
                            files: ['https://unpkg.com/leaflet@1.0.3/dist/leaflet.css']
                        },
                        wvw_map: {
                            cwd: 'src/',
                            files: [
                                'css/map.css',
                                'css/map-widgets.css'
                            ]
                        }
                    },

                    sections: {
                        widgets: [
//                            'src/views/widgets/**/*.html',
//                            '!src/views/widgets/kd-base-widget.html'
                        ],
                        wvwscorebase: 'src/views/components/wvw-score-base-widget.html',
                        kdwidget: 'src/views/widgets/kd-base-widget.html',
                        layout: {
                            template: 'src/layout/template.html',
                            header: 'src/layout/header.html',
                            menu: 'src/layout/menu.html',
                            topbar: 'src/layout/topbar.html',
                            sidebar: 'src/layout/sidebar.html',
                            fullpage: {
                                begin: 'src/layout/fullpage.begin.html',
                                end: 'src/layout/singlepage.end.html'
                            },
                            singlepage: {
                                begin: 'src/layout/singlepage.begin.html',
                                end: 'src/layout/singlepage.end.html'
                            },
                            body: {
                                begin: 'src/layout/body.begin.html',
                                end: 'src/layout/body.end.html'
                            }
                        },
                        pagecontent: 'src/views/pages/$(filename).html'
                    },

                    data: {
                        // Data to pass to templates
                        version: "1.0.0",
                        title: "WvW Live Map"
                    }
                }
            }
        },
        copy: {
            main: {
                files: [
                    // includes files within path
                    {expand: true, cwd: 'src/', src: ['images/**'], dest: '<%= grunt.config.get("dest") %>', filter: 'isFile'},
                    {expand: true, cwd: 'src/', src: ['favicon*'], dest: '<%= grunt.config.get("dest") %>', filter: 'isFile'},
                    {expand: true, cwd: 'src/', src: ['css/fonts/**'], dest: '<%= grunt.config.get("dest") %>', filter: 'isFile'},
                ],
            },
            dev: {
                files: [
                    // includes files within path
                    {expand: true, cwd: 'src/', src: ['scripts/**/*.js'], dest: '<%= grunt.config.get("dest") %>', filter: 'isFile'},
                    {expand: true, cwd: 'src/', src: ['css/**/*.css'], dest: '<%= grunt.config.get("dest") %>', filter: 'isFile'},
                ],
            },
        },
        uglify: {
            build: {
                files: [{
                        expand: true,
                        cwd: 'src/scripts',
                        src: '**/*.js',
                        dest: '<%= grunt.config.get("dest") %>scripts'
                    }]
            }
        },
        cssmin: {
            build: {
                files: [{
                        expand: true,
                        cwd: 'src/css',
                        src: '**/*.css',
                        dest: '<%= grunt.config.get("dest") %>css'
                    }]
            }
        },

        // Empties folders to start fresh
        clean: {
            build: {
                src: '<%= grunt.config.get("dest") %>'
            }
        }
    });

    grunt.loadTasks('tasks');

    grunt.registerTask('dev', ['config:dev', 'htmlbuild', 'copy']);
    grunt.registerTask('release', ['config:release', 'clean', 'htmlbuild', 'copy:main', 'uglify', 'cssmin']);

    grunt.registerTask('build', ['dev']);
    grunt.registerTask('run', ['dev']);

};
