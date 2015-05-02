module.exports = function (grunt) {
	"use strict";
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		concat: {
			js: {
				src: ["node_modules/socket.io-client/socket.io.js",  "common/game.js", "client/js/ia.js", "client/js/view.js", "client/js/network.js", "client/js/main.js"],
				dest: "client/dist.js"
			},
			css: {
				src: ["client/css/spinner.css", "client/css/main.css"],
				dest: "client/main.css"
			}
		},
		uglify : {
			main: {
				src: "client/dist.js",
				dest: "client/dist.js"
			}
		},
		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					"client/index.html": ["client/html/index.html"]
				}
			}
		},
		cssmin: {
			main: {
				src: "client/main.css",
				dest: "client/main.css"
			}
		},
		copy: {
			html: {
				expand: true,
				cwd: "client/html",
				src: "*.html",
				dest: "client/"
			}
		},
		csslint : {
			options: {
				"ids": false,
				"box-sizing": false
			},
			src: ["client/css/*.css"]
		},
		htmllint: {
			all: ["client/html/*.html"]
		},
		jshint: {
			all: ["gruntfile.js", "common/**/*.js", "server/*.js", "client/js/*.js"]
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
					src: ["client/*.js"],
					dest: "client"
				}]
			}
		},
		exec: {
			server : {
				command: "node server/app.js"
			}
		},
		inline: {
			desktop: {
				src: "client/index.html",
				dest: "dist/index.html"
			}
		},
		clean: {
			dist: ["client/*.css", "client/*.js", "client/*.html"]
		},
		jscs: {
			src: ["gruntfile.js", "common/**/*.js", "server/*.js", "client/js/*.js"],
			options: {
				disallowNewlineBeforeBlockStatements: true,
				disallowSpacesInNamedFunctionExpression: {
					beforeOpeningRoundBrace: true
				},
				requireSpacesInFunction: {
					beforeOpeningCurlyBrace: true
				},
				disallowSpacesInsideParentheses: true,
				disallowTrailingComma: true,
				disallowTrailingWhitespace: true,
				disallowYodaConditions: true,
				maximumLineLength: 200,
				disallowMixedSpacesAndTabs: true,
				validateQuoteMarks: "\"",
				validateParameterSeparator: ", ",
				validateIndentation: "\t",
				validateAlignedFunctionParameters: {
					lineBreakAfterOpeningBraces: true,
					lineBreakBeforeClosingBraces: true
				},
				safeContextKeyword: ["that"],
				requireSpacesInForStatement: true,
				requireSpacesInConditionalExpression: {
					afterTest: true,
					beforeConsequent: true,
					afterConsequent: true,
					beforeAlternate: true
				},
				requireSpaceBetweenArguments: true,
				requireSpaceBeforeObjectValues: true,
				requireSpaceBeforeKeywords: [ "else", "while", "catch" ],
				requireSpaceBeforeBlockStatements: true,
				requireSpaceBeforeBinaryOperators: true,
				requireSpaceAfterLineComment: true,
				requireSpaceAfterKeywords: true,
				requireSpaceAfterBinaryOperators: true,
				requirePaddingNewlinesBeforeKeywords: ["if", "for", "while", "do", "try", "switch", "function", "case", "return"],
				requireLineFeedAtFileEnd: true,
				requireDotNotation: true,
				requireCurlyBraces: ["if", "else", "for", "while", "do", "try", "catch", "switch", "function"],
				requireCommaBeforeLineBreak: true,
				requireCapitalizedConstructors: true,
				requireCapitalizedComments: true,
				requireBlocksOnNewline: 1
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
	grunt.loadNpmTasks("grunt-html");
	grunt.loadNpmTasks("grunt-jscs");
	grunt.loadNpmTasks("grunt-replace");
	grunt.loadNpmTasks("grunt-exec");
	grunt.loadNpmTasks("grunt-inline");
	grunt.loadNpmTasks("grunt-contrib-clean");

	grunt.registerTask("default", ["concat", "replace", "uglify", "htmlmin", "cssmin", "inline", "clean"]);
	grunt.registerTask("dev", ["concat", "copy", "replace", "inline", "clean", "exec"]);
	grunt.registerTask("test", ["csslint", "jshint", "htmllint", "jscs", "default"]);
};
