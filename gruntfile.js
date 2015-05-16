module.exports = function (grunt) {
	"use strict";
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		concat: {
			js: {
				src: ["node_modules/socket.io-client/socket.io.js",  "common/game.js", "client/js/ai/ai_bob.js", "client/js/ai/ai_banane.js", "client/js/view.js", "client/js/network.js", "client/js/main.js"],
				dest: "dist/dist.js"
			},
			css: {
				src: ["client/css/spinner.css", "client/css/main.css"],
				dest: "dist/main.css"
			}
		},
		uglify : {
			main: {
				src: "dist/dist.js",
				dest: "dist/dist.js"
			}
		},
		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					"dist/index.html": ["client/html/index.html"]
				}
			}
		},
		cssmin: {
			main: {
				src: "dist/main.css",
				dest: "dist/main.css"
			}
		},
		copy: {
			html: {
				expand: true,
				cwd: "client/html",
				src: "*.html",
				dest: "dist/"
			},
			font: {
				expand: true,
				cwd: "node_modules/roboto-fontface/fonts/",
				src: "Roboto-Light.*",
				dest: "dist/"
			}
		},
		csslint : {
			options: {
				"ids": false,
				"bulletproof-font-face": false,
				"box-sizing": false
			},
			src: ["client/css/*.css"]
		},
		htmllint: {
			all: ["client/html/*.html"]
		},
		jshint: {
			all: ["gruntfile.js", "common/**/*.js", "server/*.js", "client/js/**/*.js"]
		},
		nodeunit: {
			all: ["test/test-*.js"]
		},
		replace: {
			dist: {
				options: {
					patterns: [{
						match: "URL_SOCKETIO_SERVER",
						replacement: process.env.SOCKETIO_SERVER || ""
					}]
				},
				files: [{
					expand: true,
					flatten: true,
					src: ["dist/*.js"],
					dest: "dist"
				}]
			}
		},
		exec: {
			server: {
				command: "node server/app.js"
			}
		},
		inline: {
			desktop: {
				src: "dist/index.html",
				dest: "dist/index.html"
			}
		},
		clean: {
			dist: ["dist/*.css", "dist/*.js"]
		},
		jscs: {
			main: ["gruntfile.js", "common/**/*.js", "server/*.js", "client/js/**/*.js"],
			fix: {
				options: {
					fix: true
				},
				files: {
					src: ["gruntfile.js", "common/**/*.js", "server/*.js", "client/js/**/*.js"]
				}
			}
		},
		watch: {
			options: {
				livereload: 13377,
				atBegin: true
			},
			client: {
				files: ["client/**/*", "common/**/*"],
				tasks: ["dev"]
			}
		},
		nodemon: {
			dev: {
				script: "server/app.js"
			}
		},
		concurrent: {
			server: ["watch", "nodemon"]
		},
		imageEmbed: {
			dist: {
				src: [ "dist/main.css" ],
				dest: "dist/main.css",
				options: {
					maxImageSize: 0
				}
			}
		},
		font_optimizer: {
			Roboto: {
				options: {
					chars: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.,?;/:!*^@èé\"{}[(])=+}/-#ù%><\u21B5",
					includeFeatures: ["kern"]
				},
				files: {
					"dist/": ["node_modules/roboto-fontface/fonts/*.ttf"]
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-htmlmin");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-csslint");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-nodeunit");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-concurrent");
	grunt.loadNpmTasks("grunt-nodemon");
	grunt.loadNpmTasks("grunt-html");
	grunt.loadNpmTasks("grunt-jscs");
	grunt.loadNpmTasks("grunt-replace");
	grunt.loadNpmTasks("grunt-exec");
	grunt.loadNpmTasks("grunt-inline");
	grunt.loadNpmTasks("grunt-image-embed");
	grunt.loadNpmTasks("grunt-font-optimizer");

	grunt.registerTask("default", ["concat", "replace",  "uglify", "copy:font", "htmlmin", "cssmin", "imageEmbed", "inline", "clean"]);
	grunt.registerTask("dev", ["concat", "copy", "replace", "imageEmbed", "inline", "clean"]);
	grunt.registerTask("test", ["csslint", "jshint", "htmllint", "jscs:main", "default"]);
	grunt.registerTask("server", ["concurrent:server"]);
	grunt.registerTask("fix", ["jscs:fix"]);
};
